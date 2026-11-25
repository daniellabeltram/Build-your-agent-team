> Packaged from the expert team's project skill. Paths like `docs/…`, `knowledge/…` or `work/…` refer to the original project: in this skill, the research is in `references/research/` and the knowledge files are in `references/knowledge/`. Mentions of other agents mean other specialists you can recommend the user consult.

# Spreadsheet financial modeling

## Purpose
Produce models the consultant can trust, audit, and edit.

## Standards
1. **Structure:** separate tabs for `Assumptions`, `Titles`, `P&L`, `CashFlow`, `Scenarios`, and `Notes/Sources`.
2. **Inputs vs. formulas:** every hard-coded input lives on `Assumptions` and is visually marked (blue font). Every other cell is a formula (black font).
3. **No magic numbers** inside formulas. Reference named input cells.
4. **Scenarios:** a single scenario switch (Base / Downside / Upside) drives the key drivers (units, returns, discount, print cost, timing).
5. **Checks tab:** balance checks, sums that must tie, and error flags.
6. **Sources:** each assumption cites a doc in `docs/` or a URL, or is labeled est.
7. **Units and periods** are labeled in the headers (USD, units, month index).

## Method
1. Agree on the question and outputs first (e.g. capital need, break-even, max advance).
2. Draft the assumptions list from docs/04 and the requesting agent's inputs.
3. Build the model with Python (`openpyxl`) via Bash when available, writing formulas rather than pasted values. Save it under `work/models/`.
4. Recalculate and verify: spot-check 3 cells by hand and confirm the checks pass.
5. Summarize the key outputs in the reply. The file is the evidence, not the answer.

## Pitfalls
- Circular references, hidden hard-codes, and unlabeled units.
- Monthly and annual mixing errors (e.g. annual rent in a monthly row).
