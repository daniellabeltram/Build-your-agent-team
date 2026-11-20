---
name: agent-skill-authoring
description: Conventions and checklist for creating new expert agents and skills, or improving existing ones, in this project's .claude/ directory. Use when adding, editing, merging, or auditing agents or skills.
metadata:
  roster-id: S38
  used-by:
  - team-architect
---

# Agent & skill authoring

*Infrastructure skill S38. Preloaded into `team-architect`.*

## Where things live (project scope only)
- Agents: `.claude/agents/<agent-name>.md`
- Skills: `.claude/skills/<skill-name>/SKILL.md` (plus optional supporting files in the same folder)
- Validator: `python3 .claude/scripts/validate_team.py`
- Team docs to keep in sync: `docs/expert-roster.md`, `.claude/skills/expert-team-routing/SKILL.md`, `CLAUDE.md`
- **Never write to `~/.claude/`** or anywhere outside this repository.

## Subagent file rules (Claude Code docs: sub-agents)
- YAML frontmatter must start on line 1 between `---` markers. `name` and `description` are required. Field names are camelCase and must match exactly (unknown fields are silently ignored).
- `name`: lowercase-kebab, unique, no `:`, can't start with `-`.
- `description`: say **when Claude should delegate**. Start with the one-line job, then trigger topics.
- `tools`: an allowlist. Experts use `Read, Grep, Glob, WebSearch, WebFetch, Write, Edit, Skill` (+ `Bash` for modeling). Only the orchestrator gets `Agent`.
- `skills`: a YAML list of skill names to **preload** (full content injected; first 32 names only). Every expert gets `project-research-library`.
- Optional fields used here: `model: inherit`, `color` (domain color), `effort`.
- The body is the system prompt. Follow the house template: Role → Mission → What you own → Your skills → How you work → Output → Boundaries → Collaborators.

## Skill file rules (Claude Code docs: skills)
- `SKILL.md` with frontmatter. `description` is recommended: put the key use case first. The description plus `when_to_use` is truncated at 1,536 characters.
- The directory name is the `/` command. Use lowercase-kebab.
- `user-invocable: false` for background knowledge. `disable-model-invocation: true` for side-effecting commands. **A skill with `disable-model-invocation: true` can't be preloaded into agents.**
- `context: fork` + `agent: <name>` runs the skill inside that subagent (used by `/ask-the-team` and `/evolve-team`).
- Keep `SKILL.md` under 500 lines. Move detail into supporting files and link to them.
- House structure: Purpose → reference facts (with doc citations) → Method (numbered) → Output → Pitfalls/Boundary.
- Record the roster ID and agents in `metadata` (`roster-id`, `used-by`).

## Create a new agent
1. Confirm there's a real gap. Check the routing table and roster for overlap, and prefer extending an existing agent.
2. Choose the next roster ID (A28, A29, …), a name, domain, and color.
3. List its skills: reuse existing skills first, and create new ones only for genuinely new methods.
4. Write the agent file using the template, preloading `project-research-library` + its skills.
5. Add the agent to each reused skill's `metadata.used-by` and its "Preloaded into" line.
6. Update `expert-team-routing` (Experts table and any panels), `docs/expert-roster.md` (Parts 1–3 + Part 4), and the `CLAUDE.md` team table.
7. Run the validator and fix every error.

## Create a new skill
1. Name it, write the description (what + when), and write the body using the house structure.
2. Wire it into every agent that should preload it (`skills:` list) and record them in `metadata.used-by`.
3. Update `docs/expert-roster.md` Part 2/3 and run the validator.

## Improve an existing agent or skill
1. Gather evidence: the consultant's feedback, weak outputs, overlaps, outdated facts in docs, and descriptions that never trigger.
2. Make the smallest change that fixes it: tighten the description, add a method step, fix a fact (with source), or split or merge.
3. Keep all cross-references in sync and run the validator.
4. Summarize what changed and why.

## Quality checklist
- [ ] The description clearly says when to use it
- [ ] Facts cite `docs/` or a source, or are labeled est.
- [ ] No overlap with an existing agent or skill without a reason
- [ ] Routing, roster, and CLAUDE.md are updated
- [ ] The validator passes
- [ ] The team stays within 10–50 agents
