// Offline smoke test: no API key and no network needed.
// 1) Composes every agent's system prompt and checks it contains its knowledge, skills and the research.
// 2) Runs a single-expert job and a full team job with a fake model.
// 3) Bundles the Netlify functions with esbuild (as Netlify does) and checks the setup endpoint.
import assert from "node:assert/strict";
import { build } from "esbuild";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { systemFor, AGENT_NAMES, EXPERT_NAMES, getAgent } from "../netlify/lib/prompts.mjs";
import { parseRequest, runJob } from "../netlify/lib/run-job.mjs";
import team from "../src/generated/team.json" with { type: "json" };

// 1. prompts
assert.equal(AGENT_NAMES.length, team.agents.length);
for (const name of AGENT_NAMES) {
  const a = getAgent(name);
  const sys = systemFor(name);
  assert.equal(sys.length, 2);
  assert.ok(sys[0].text.includes("docs/04-startup-and-operating-costs.md"), `${name}: research missing`);
  assert.ok(sys[1].text.includes(a.prompt.slice(0, 80)), `${name}: agent prompt missing`);
  for (const k of a.knowledge) assert.ok(sys[1].text.includes(k.path), `${name}: knowledge ${k.path} missing`);
  for (const s of a.skills) assert.ok(sys[1].text.includes(`Skill: ${s}`), `${name}: skill ${s} missing`);
  assert.equal(sys[0].text, systemFor(AGENT_NAMES[0])[0].text, "research block must be identical for caching");
}
console.log(`prompts: ${AGENT_NAMES.length} agents OK (knowledge, skills and research included)`);

// 2. jobs with a fake model
const calls = [];
const fakeAsk = async ({ brain, system, messages, format }) => {
  calls.push({ brain, agent: system[1].text.match(/^# (.+)$/m)?.[1], format: Boolean(format) });
  if (format) return { text: JSON.stringify({ shared_assumptions: "5 titles, $750k", panel: [
    { agent: "finance-capital-planner", reason: "money", brief: "Capital need" },
    { agent: "publishing-strategy-advisor", reason: "strategy", brief: "Go/no-go" },
    { agent: "not-a-real-agent", reason: "x", brief: "x" }] }), model: "fake" };
  return { text: `answer to: ${messages.at(-1).content.slice(0, 40)}`, model: `fake-${brain}` };
};
const saves = [];
const save = async (s) => saves.push(JSON.parse(JSON.stringify(s)));

const one = await runJob(parseRequest({ mode: "agent", agent: "fundraising-investor-advisor",
  messages: [{ role: "assistant", content: "stray" }, { role: "user", content: "How much should we raise?" }] }), { ask: fakeAsk, save });
assert.equal(one.status, "done");
assert.equal(one.contributors[0].firstName, "Celeste");
assert.equal(calls[0].brain, "opus");
console.log("single expert: OK (Celeste, opus)");

calls.length = 0;
const t = await runJob(parseRequest({ mode: "team", messages: [{ role: "user", content: "Should we launch in 2027?" }] }), { ask: fakeAsk, save });
assert.equal(t.status, "done");
assert.deepEqual(t.panel.map((p) => p.agent), ["finance-capital-planner", "publishing-strategy-advisor"], "unknown agents must be dropped");
assert.equal(calls.length, 1 + 2 + 2 + 1, "plan + round 1 + round 2 + synthesis");
assert.ok(t.experts["finance-capital-planner"].round2);
assert.equal(t.contributors[0].name, "orchestrator");
assert.ok(saves.some((s) => s.steps?.some((x) => x.label.startsWith("Round 2"))), "progress saved");
console.log(`team: OK (panel ${t.panel.map((p) => getAgent(p.agent).firstName).join(", ")}; ${calls.length} model calls)`);

assert.throws(() => parseRequest({ mode: "agent", agent: "nobody", messages: [{ role: "user", content: "hi" }] }));
assert.throws(() => parseRequest({ mode: "team", messages: [] }));
assert.ok(EXPERT_NAMES.length === AGENT_NAMES.length - 2);
console.log("validation: OK");

// 3. bundle functions like Netlify and call the setup endpoint
const out = mkdtempSync(join(tmpdir(), "fn-"));
await build({ entryPoints: ["netlify/functions/run.mjs", "netlify/functions/job.mjs"], bundle: true, platform: "node",
  format: "esm", target: "node22", outdir: out, outExtension: { ".js": ".mjs" }, logLevel: "error",
  banner: { js: "import { createRequire } from 'module'; const require = createRequire(import.meta.url);" } });
const job = await import(pathToFileURL(join(out, "job.mjs")));
assert.equal(job.config.path, "/api/job");
const run = await import(pathToFileURL(join(out, "run.mjs")));
assert.deepEqual(run.config, { path: "/api/run", background: true });
const res = await job.default(new Request("https://example.test/api/job"));
const body = await res.json();
assert.equal(body.ok, true);
console.log(`functions: bundled OK; setup endpoint says ${JSON.stringify(body)}`);
console.log("SMOKE TEST PASSED");
