// Builds system prompts for experts and the orchestrator from the generated team data.
// Layout (for prompt caching): [shared research] [agent block], each with a cache breakpoint.
// The research block is identical for every agent, so agents on the same model share its cache.
import team from "./generated/team-data.mjs";

export const AGENT_NAMES = Object.keys(team.agents);
export const EXPERT_NAMES = AGENT_NAMES.filter((n) => n !== "orchestrator" && n !== "team-architect");
export const getAgent = (name) => team.agents[name];

const RESEARCH_TEXT =
  "# Shared research library (docs/)\n\nThis is the project's research, which every expert on the team relies on.\n" +
  team.research.map((d) => `\n\n===== ${d.path} =====\n${d.text}`).join("");

const WEB_CONTEXT = `## Running in the web app
You're answering inside the team's web chat app, not Claude Code. That means:
- You can't read files, run commands, browse, or call other agents. Everything you'd normally read is **already included below**: your knowledge folder first, then your preloaded skills. The shared research is above.
- Treat your knowledge folder as already read "before every answer", as your instructions require.
- Don't say you saved a file. Put deliverables (tables, drafts, checklists) directly in your answer.
- Where your instructions mention Handoffs, still list them. The consultant (or the orchestrator) will follow up.
- Facts that may have changed since the research was written must be labeled "to verify". Don't invent sources.`;

function agentBlock(agent) {
  const knowledge = agent.knowledge.length
    ? agent.knowledge.map((k) => `\n\n===== ${k.path} =====\n${k.text}`).join("")
    : "\n\n(Your knowledge folder is empty.)";
  const skills = agent.skills.map((s) => `\n\n===== Skill: ${s} =====\n${team.skills[s].body}`).join("");
  return `${agent.prompt}\n\n${WEB_CONTEXT}\n\n# Your knowledge folder (knowledge/${agent.name}/), read first${knowledge}\n\n# Your preloaded skills${skills}`;
}

export function systemFor(name) {
  const agent = team.agents[name];
  if (!agent) throw new Error(`Unknown agent: ${name}`);
  return [
    { type: "text", text: RESEARCH_TEXT, cache_control: { type: "ephemeral" } },
    { type: "text", text: agentBlock(agent), cache_control: { type: "ephemeral" } },
  ];
}

// Roster line used by the orchestrator to pick a panel.
export function rosterText() {
  return EXPERT_NAMES.map((n) => {
    const a = team.agents[n];
    return `- ${n} (${a.firstName}, ${a.title}, model ${a.model})`;
  }).join("\n");
}
