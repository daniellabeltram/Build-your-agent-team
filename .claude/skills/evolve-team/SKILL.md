---
name: evolve-team
description: Create new expert agents or skills, or improve existing ones, using the team-architect agent.
argument-hint: '[what to create or improve]'
disable-model-invocation: true
context: fork
agent: team-architect
background: false
metadata:
  roster-id: S40
  used-by:
  - consultant (slash command)
---

# Evolve the team

*Infrastructure skill S40. A `/evolve-team` command that runs inside the `team-architect` agent.*

Request:

> $ARGUMENTS

Carry out this request by following the `agent-skill-authoring` skill. Create or improve the agents and skills, keep the routing table, roster, and CLAUDE.md in sync, and run `python3 .claude/scripts/validate_team.py` until it passes. Finish with a summary of the files you created or changed. If the request is empty, audit the team for gaps, overlaps, and stale facts and propose improvements, without making changes.
