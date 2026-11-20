---
name: cross-agent-synthesis
description: Merge input from several expert agents into one coherent answer, decision memo, plan, or executive summary, resolving conflicts and making trade-offs explicit. Use whenever more than one expert has contributed, or the consultant needs a concise deliverable.
metadata:
  roster-id: S35
  used-by:
  - engagement-coordinator
  - finance-capital-planner
  - orchestrator
  - publishing-strategy-advisor
---

# Cross-agent synthesis & reporting

*Roster skill S35. Preloaded into: `engagement-coordinator`, `finance-capital-planner`, `orchestrator`, `publishing-strategy-advisor`.*

## Purpose
The consultant should receive **one** clear answer, not a pile of expert opinions.

## Method
1. **Collect** each expert's findings with their key numbers, assumptions, and confidence.
2. **Align** the assumptions. If experts used different numbers (e.g. capital need, title count), reconcile them to one assumption set and say which one you chose and why.
3. **Surface conflicts** explicitly (e.g. marketing wants a bigger budget while finance wants to preserve runway). Present the trade-off and recommend a resolution.
4. **Decide:** lead with the recommendation (bottom line up front).
5. **Support:** 3–5 key reasons, each traceable to an expert and a source.
6. **Risks and open questions:** what could change the answer, and what to verify next.
7. **Next steps:** specific actions, owners (agents/roles), and timing.

## Output template
```
## Bottom line
<1–3 sentences>

## Recommendation & rationale
- ...

## Where the experts disagreed (and how we resolved it)
- ...

## Key numbers (with sources / est. labels)
| Item | Value | Source |

## Risks & open questions
- ...

## Next steps
| Action | Owner | When |

## Contributors
<agents consulted>
```

## Quality bar
No unexplained contradictions. Every number is sourced or labeled est. Plain language. Fits on 1–2 pages unless the consultant asks for more.
