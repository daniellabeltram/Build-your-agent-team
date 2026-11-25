#!/usr/bin/env node
// ask-celeste.mjs: ask Celeste (the fundraising-investor-advisor agent) a question
// with the Claude Agent SDK.
//
//   node ask-celeste.mjs "Should we take a $150k SBA loan or raise from angels?"
//   node ask-celeste.mjs --check          # load the agent + knowledge folder, no API call
//   node ask-celeste.mjs --allow-files "..."   # also let Celeste write files / run Bash
//
// How it works:
//   1. Reads Celeste's definition from ../.claude/agents/fundraising-investor-advisor.md
//      (frontmatter + system prompt) and every file in ../knowledge/fundraising-investor-advisor/.
//   2. Starts an Agent SDK session in the project root with settingSources ["project"], so
//      Claude Code loads the project's agents, skills and CLAUDE.md, and sets
//      `agent: "fundraising-investor-advisor"` to run Celeste as the main agent (her prompt,
//      tools and model apply, like `claude --agent`).
//   3. Sends your question with the knowledge-folder contents attached, and prints her answer.

import { query } from "@anthropic-ai/claude-agent-sdk";
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, relative, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const AGENT = "fundraising-investor-advisor";
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const AGENT_FILE = join(ROOT, ".claude", "agents", `${AGENT}.md`);
const KNOWLEDGE_DIR = join(ROOT, "knowledge", AGENT);
const TEXT_EXT = /\.(md|markdown|txt|csv|json|ya?ml)$/i;
const MAX_KNOWLEDGE_CHARS = 200_000;

// ---------- load the agent definition ----------
function loadAgent() {
  if (!existsSync(AGENT_FILE)) throw new Error(`Agent file not found: ${AGENT_FILE}`);
  const text = readFileSync(AGENT_FILE, "utf8");
  const m = text.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!m) throw new Error(`No YAML frontmatter in ${AGENT_FILE}`);
  const fm = parseFrontmatter(m[1]);
  if (fm.name !== AGENT) throw new Error(`Expected name "${AGENT}", found "${fm.name}"`);
  const persona = (m[2].match(/\*\*Name:\*\*\s*(\w+)/) || [])[1] || "Celeste";
  return { ...fm, prompt: m[2].trim(), persona };
}

// Minimal parser for this project's frontmatter: `key: value`, quoted values, and `- item` lists.
function parseFrontmatter(src) {
  const out = {};
  let listKey = null;
  for (const line of src.split("\n")) {
    const item = line.match(/^\s*-\s+(.*)$/);
    if (item && listKey) { out[listKey].push(unquote(item[1])); continue; }
    const kv = line.match(/^([A-Za-z][\w-]*):\s*(.*)$/);
    if (!kv) continue;
    const [, key, raw] = kv;
    if (raw === "") { out[key] = []; listKey = key; }
    else { out[key] = unquote(raw); listKey = null; }
  }
  if (typeof out.tools === "string") out.tools = out.tools.split(",").map((t) => t.trim()).filter(Boolean);
  return out;
}
function unquote(v) {
  v = v.trim();
  if (v.startsWith("'") && v.endsWith("'")) return v.slice(1, -1).replace(/''/g, "'");
  if (v.startsWith('"') && v.endsWith('"')) return JSON.parse(v);
  return v;
}

// ---------- load the knowledge folder ----------
function loadKnowledge() {
  if (!existsSync(KNOWLEDGE_DIR)) return { files: [], text: "", skipped: [] };
  const files = [], skipped = [];
  const walk = (dir) => {
    for (const name of readdirSync(dir).sort()) {
      const p = join(dir, name);
      if (statSync(p).isDirectory()) { if (name !== "archive") walk(p); continue; }
      (TEXT_EXT.test(name) ? files : skipped).push(p);
    }
  };
  walk(KNOWLEDGE_DIR);
  let text = "";
  for (const p of files) {
    text += `\n\n===== ${relative(ROOT, p)} =====\n${readFileSync(p, "utf8").trim()}\n`;
  }
  if (text.length > MAX_KNOWLEDGE_CHARS) text = text.slice(0, MAX_KNOWLEDGE_CHARS) + "\n[...truncated]";
  return { files, text, skipped };
}

// ---------- CLI ----------
const args = process.argv.slice(2);
const check = args.includes("--check");
const allowFiles = args.includes("--allow-files");
const question = args.filter((a) => !a.startsWith("--")).join(" ").trim();

if (!check && !question) {
  console.error('Usage: node ask-celeste.mjs "your question"   (or --check to test loading)');
  process.exit(2);
}

const agent = loadAgent();
const knowledge = loadKnowledge();

// Read-only plus web research by default; --allow-files also lets her save models under work/.
const autoAllowed = ["Read", "Grep", "Glob", "WebSearch", "WebFetch", "Skill"];
if (allowFiles) autoAllowed.push("Write", "Edit", "Bash");

const options = {
  cwd: ROOT,
  settingSources: ["project"],      // load .claude/agents, .claude/skills and CLAUDE.md
  agent: AGENT,                     // run Celeste as the main agent
  allowedTools: autoAllowed,
  permissionMode: "dontAsk",        // never prompt; anything not pre-approved is denied
  maxTurns: 30,
};

if (check) {
  await runCheck();
} else {
  await ask();
}

async function ask() {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error("ANTHROPIC_API_KEY is not set. See sdk/README.md.");
    process.exit(2);
  }
  const prompt = [
    question,
    "",
    `Your knowledge folder (knowledge/${AGENT}/) is attached below. It's already read for you, so treat it as having been read first.`,
    "End your answer with a \"Documents used\" list of every file you relied on.",
    knowledge.text || "\n(No knowledge files found.)",
  ].join("\n");

  console.error(`Asking ${agent.persona} (${AGENT}, model: ${agent.model})…\n`);
  let answer = "";
  for await (const msg of query({ prompt, options })) {
    if (msg.type === "result") {
      if (msg.subtype === "success") answer = msg.result;
      else { console.error(`Run ended: ${msg.subtype}`); process.exitCode = 1; }
      if (msg.total_cost_usd != null) console.error(`\n[cost: $${msg.total_cost_usd.toFixed(4)}, turns: ${msg.num_turns}]`);
    }
  }
  if (answer) console.log(answer);
}

// Loads the agent through the SDK without calling the model: it starts a session, asks
// Claude Code which agents it loaded, and confirms Celeste is among them.
async function runCheck() {
  console.log(`Agent file:   ${relative(ROOT, AGENT_FILE)}`);
  console.log(`Name:         ${agent.name} (persona: ${agent.persona})`);
  console.log(`Model:        ${agent.model}`);
  console.log(`Tools:        ${agent.tools.join(", ")}`);
  console.log(`Skills:       ${agent.skills.join(", ")}`);
  console.log(`Prompt:       ${agent.prompt.length} chars`);
  console.log(`Knowledge:    ${knowledge.files.length} file(s), ${knowledge.text.length} chars`);
  for (const f of knowledge.files) console.log(`              - ${relative(ROOT, f)}`);
  for (const f of knowledge.skipped) console.log(`              (skipped non-text: ${relative(ROOT, f)})`);
  const missing = agent.skills.filter((s) => !existsSync(join(ROOT, ".claude", "skills", s, "SKILL.md")));
  if (missing.length) throw new Error(`Missing skills: ${missing.join(", ")}`);
  console.log("Skill files:  all present");

  // A prompt stream that never sends a message keeps the session idle, so no API call is made.
  let release;
  const idle = (async function* () { await new Promise((r) => (release = r)); })();
  const q = query({ prompt: idle, options });
  try {
    const agents = await withTimeout(q.supportedAgents(), 60_000);
    const found = agents.find((a) => a.name === AGENT);
    console.log(`SDK session:  ${agents.length} agents loaded from .claude/agents/`);
    if (!found) throw new Error(`SDK did not load "${AGENT}"`);
    console.log(`SDK sees:     ${found.name}${found.model ? ` (model: ${found.model})` : ""}`);
    console.log("CHECK PASSED: Celeste loads correctly. Set ANTHROPIC_API_KEY and pass a question to ask her.");
  } finally {
    release?.();
    q.close();
  }
}

function withTimeout(p, ms) {
  return Promise.race([p, new Promise((_, rej) => setTimeout(() => rej(new Error("Timed out waiting for the SDK")), ms))]);
}
