---
name: ask-the-team
description: Put a question to the full expert team. The orchestrator picks the right experts, has them work together, and returns one combined answer.
argument-hint: '[question]'
disable-model-invocation: true
context: fork
agent: orchestrator
background: false
metadata:
  roster-id: S39
  used-by:
  - consultant (slash command)
---

# Ask the expert team

*Infrastructure skill S39. A `/ask-the-team` command that runs inside the `orchestrator` agent.*

The consultant's question:

> $ARGUMENTS

Answer it using the expert team:
1. Use the `expert-team-routing` skill to pick the smallest expert panel that covers the question.
2. Brief the experts in parallel with a shared context packet, then run a collaboration round where their findings depend on each other.
3. Synthesize one combined answer with the `cross-agent-synthesis` template. List the contributing experts.
4. If the question is empty, reply with a short guide to what the team can do, plus five example questions.
