// The work behind one chat turn: either one expert answers, or the orchestrator runs the team.
// `ask` (one Claude call) and `save` (persist progress) are injected so this can be tested offline.
import { systemFor, getAgent, EXPERT_NAMES, rosterText } from "./prompts.mjs";

const MAX_HISTORY = 20;          // messages of history sent to a single expert
const MAX_CHARS = 40_000;        // cap on one incoming message
const MAX_PANEL = 6;

/** Validates and normalizes the browser's request body. Throws on bad input. */
export function parseRequest(body) {
  const mode = body?.mode === "team" ? "team" : "agent";
  const agent = mode === "team" ? "orchestrator" : String(body?.agent ?? "");
  if (mode === "agent" && !getAgent(agent)) throw new Error(`Unknown agent "${agent}"`);
  const raw = Array.isArray(body?.messages) ? body.messages : [];
  const messages = raw
    .filter((m) => (m?.role === "user" || m?.role === "assistant") && typeof m.content === "string" && m.content.trim())
    .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_CHARS) }))
    .slice(-MAX_HISTORY);
  while (messages.length && messages[0].role !== "user") messages.shift();
  if (!messages.length || messages.at(-1).role !== "user") throw new Error("The last message must be a question from you.");
  // The API needs alternating roles; merge any consecutive same-role messages.
  const merged = [];
  for (const m of messages) {
    if (merged.length && merged.at(-1).role === m.role) merged.at(-1).content += `\n\n${m.content}`;
    else merged.push({ ...m });
  }
  return { mode, agent, messages: merged, collaborate: body?.collaborate !== false };
}

export async function runJob(req, { ask, save }) {
  const state = { status: "running", mode: req.mode, agent: req.agent, steps: [], experts: {} };
  const step = async (label) => { state.steps.push({ label, at: new Date().toISOString() }); await save(state); };

  if (req.mode === "agent") {
    const a = getAgent(req.agent);
    await step(`${a.firstName} is thinking…`);
    const res = await ask({ brain: a.model, system: systemFor(req.agent), messages: req.messages });
    return finish(state, save, res.text, [{ name: req.agent, firstName: a.firstName, model: res.model }]);
  }
  return runTeam(req, state, { ask, save, step });
}

async function runTeam(req, state, { ask, save, step }) {
  const orch = getAgent("orchestrator");
  const question = req.messages.at(-1).content;
  const context = req.messages.slice(0, -1).slice(-6)
    .map((m) => `${m.role === "user" ? "Consultant" : "Team answer"}: ${m.content.slice(0, 3000)}`).join("\n\n");

  // 1. Orchestrator picks the panel.
  await step(`${orch.firstName} (orchestrator) is choosing the experts…`);
  const plan = await planPanel({ ask, orch, question, context });
  state.panel = plan.panel;
  state.assumptions = plan.shared_assumptions;
  await step(`Panel: ${plan.panel.map((p) => getAgent(p.agent).firstName).join(", ")}`);

  // 2. Round 1: parallel briefs.
  await step("Round 1: experts are answering in parallel…");
  const round1 = await Promise.all(plan.panel.map(async (p) => {
    const a = getAgent(p.agent);
    const brief = [
      `Brief from ${orch.firstName}, the team orchestrator.`,
      `Consultant's question: ${question}`,
      context && `Earlier in this conversation:\n${context}`,
      `Shared assumptions for every expert: ${plan.shared_assumptions}`,
      `Your part: ${p.brief}`,
      `Other experts on this panel: ${plan.panel.filter((x) => x.agent !== p.agent).map((x) => `${x.agent} (${x.brief})`).join("; ") || "none"}.`,
      "Answer in the standard expert response format, in under about 500 words.",
    ].filter(Boolean).join("\n\n");
    try {
      const r = await ask({ brain: a.model, system: systemFor(p.agent), messages: [{ role: "user", content: brief }], maxTokens: 12000 });
      state.experts[p.agent] = { firstName: a.firstName, title: a.title, model: r.model, round1: r.text };
    } catch (err) {
      state.experts[p.agent] = { firstName: a.firstName, title: a.title, error: err.message };
    }
    await save(state);
    return p.agent;
  }));

  const answered = round1.filter((n) => state.experts[n].round1);
  if (!answered.length) throw new Error("None of the experts could answer. Check the API key and try again.");

  // 3. Round 2: collaboration on each other's findings.
  if (req.collaborate && answered.length > 1) {
    await step("Round 2: experts are reviewing each other's findings…");
    await Promise.all(answered.map(async (name) => {
      const a = getAgent(name);
      const others = answered.filter((n) => n !== name)
        .map((n) => `### ${state.experts[n].firstName} (${n})\n${state.experts[n].round1}`).join("\n\n");
      const prompt = [
        `Round 2 from ${orch.firstName}. Here's what the other experts said about: "${question}"`,
        others,
        "Your Round 1 answer:", state.experts[name].round1,
        "In under 250 words: (1) where you agree, (2) where you disagree and why, (3) any number or recommendation you'd now change, and (4) anything you need another expert to answer. Don't repeat your Round 1 answer.",
      ].join("\n\n");
      try {
        const r = await ask({ brain: a.model, system: systemFor(name), messages: [{ role: "user", content: prompt }], maxTokens: 6000 });
        state.experts[name].round2 = r.text;
      } catch (err) {
        state.experts[name].round2Error = err.message;
      }
      await save(state);
    }));
  }

  // 4. Synthesis.
  await step(`${orch.firstName} is combining the answers…`);
  const material = answered.map((n) => {
    const e = state.experts[n];
    return `## ${e.firstName}, ${e.title} (${n})\n### Round 1\n${e.round1}${e.round2 ? `\n### Round 2 (collaboration)\n${e.round2}` : ""}`;
  }).join("\n\n");
  const failed = Object.entries(state.experts).filter(([, e]) => e.error).map(([n, e]) => `${n}: ${e.error}`);
  const synth = await ask({
    brain: orch.model,
    system: systemFor("orchestrator"),
    maxTokens: 16000,
    messages: [{
      role: "user",
      content: [
        `The consultant asked: ${question}`,
        context && `Earlier in this conversation:\n${context}`,
        `Shared assumptions you gave the panel: ${plan.shared_assumptions}`,
        `The experts' work:\n\n${material}`,
        failed.length && `These experts failed to answer, so say so: ${failed.join("; ")}`,
        "Write ONE combined answer using your cross-agent-synthesis template. Introduce yourself by name first, as your personality section says. Reconcile numbers, state the disagreements and how you resolved them, and end with a Contributors line naming each expert by first name and role.",
      ].filter(Boolean).join("\n\n"),
    }],
  });
  const contributors = answered.map((n) => ({ name: n, firstName: state.experts[n].firstName, model: state.experts[n].model }));
  return finish(state, save, synth.text, [{ name: "orchestrator", firstName: orch.firstName, model: synth.model }, ...contributors]);
}

async function planPanel({ ask, orch, question, context }) {
  const schema = {
    type: "object",
    additionalProperties: false,
    required: ["panel", "shared_assumptions"],
    properties: {
      shared_assumptions: { type: "string", description: "One paragraph of assumptions every expert must use" },
      panel: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          required: ["agent", "reason", "brief"],
          properties: {
            agent: { type: "string", enum: EXPERT_NAMES },
            reason: { type: "string" },
            brief: { type: "string", description: "The specific sub-question this expert must answer" },
          },
        },
      },
    },
  };
  const res = await ask({
    brain: orch.model,
    system: systemFor("orchestrator"),
    maxTokens: 8000,
    format: { type: "json_schema", schema },
    messages: [{
      role: "user",
      content: [
        "PLANNING STEP ONLY. Don't answer the question yet.",
        `Consultant's question: ${question}`,
        context && `Earlier in this conversation:\n${context}`,
        `Available experts:\n${rosterText()}`,
        `Pick the smallest panel that covers the question (usually 2–5, at most ${MAX_PANEL}) using your expert-team-routing skill. For each expert, write a specific brief. Then write the shared assumptions they must all use. If the consultant asks for every expert, you may pick up to ${MAX_PANEL} of the most relevant.`,
      ].filter(Boolean).join("\n\n"),
    }],
  });
  let plan;
  try { plan = JSON.parse(res.text); } catch { plan = null; }
  const seen = new Set();
  const panel = (plan?.panel ?? [])
    .filter((p) => EXPERT_NAMES.includes(p.agent) && !seen.has(p.agent) && seen.add(p.agent))
    .slice(0, MAX_PANEL);
  if (!panel.length) {
    // Fallback: a general strategy panel.
    return {
      shared_assumptions: "Use the recommended starting position in docs/README.md.",
      panel: ["publishing-strategy-advisor", "finance-capital-planner", "risk-insurance-advisor"]
        .map((agent) => ({ agent, reason: "default panel", brief: "Answer the consultant's question from your domain." })),
    };
  }
  return { panel, shared_assumptions: plan.shared_assumptions || "Use the recommended starting position in docs/README.md." };
}

async function finish(state, save, answer, contributors) {
  Object.assign(state, { status: "done", answer, contributors });
  state.steps.push({ label: "Done", at: new Date().toISOString() });
  await save(state);
  return state;
}
