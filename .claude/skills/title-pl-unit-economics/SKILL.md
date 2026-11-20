---
name: title-pl-unit-economics
description: Build per-title profit-and-loss and unit economics for books, including discounts, distributor fees, printing, royalties, returns, and subsidiary income. Use before setting an advance, a print run, or a price, or when evaluating whether a list is viable.
metadata:
  roster-id: S05
  used-by:
  - editorial-acquisitions-director
  - finance-capital-planner
  - production-manufacturing-manager
  - publishing-strategy-advisor
  - royalties-accounting-tax-specialist
  - sales-distribution-manager
---

# Title P&L & unit economics

*Roster skill S05. Preloaded into: `editorial-acquisitions-director`, `finance-capital-planner`, `production-manufacturing-manager`, `publishing-strategy-advisor`, `royalties-accounting-tax-specialist`, `sales-distribution-manager`.*

## Purpose
Every acquisition decision should rest on a title P&L. This skill is the standard method for building one.

## Reference economics: $28 hardcover (docs/04, est.)
| Line | Per copy |
|---|---|
| List price | $28.00 |
| Trade discount (~50–55%) | −$14.70 |
| Publisher receipts | $13.30 |
| Distributor fee (25–30% of net) | −$3.70 |
| Print cost (3k run, $3–5/unit) | −$4.00 |
| Royalty (10% of list) | −$2.80 |
| **Contribution** | **≈ $2.80** |

Typical title cost: **$18k low / $48k typical / $130k high**, covering the advance, editing, design, printing, freight, ARCs, marketing, and audio. Returns run **20–35%** of shipped units. Break-even for a $48k title is roughly **7,000–10,000 net hardcover copies** before ebook, audio, and rights income.

## Standard royalty assumptions (est.)
- Hardcover: 10% of list to 5k copies, 12.5% to 10k, 15% after
- Trade paperback: 7.5% of list
- Ebook: 25% of net receipts
- Audio: 25% of net (if produced in-house)
- Subsidiary rights splits: commonly 50/50 for book club and paperback; 75–80% to the author for translation and film when the publisher controls those rights

## Method
1. Forecast **gross units shipped** by format and channel, then apply the return rate to get **net units**.
2. Compute net receipts per format (list × (1 − discount)).
3. Subtract the distributor fee, printing (with print and reprint quantities), and freight.
4. Compute royalties earned, and compare them with the advance: **earned out** or **unearned balance**.
5. Add subsidiary rights income (foreign, audio license, film options) with a probability weight.
6. Subtract direct marketing and allocate overhead (e.g. 15–25% of net revenue).
7. Report the **contribution margin, break-even units, maximum affordable advance, and payback month**.
8. Run sensitivities on sales ±30%, returns 15/25/35%, and print cost ±20%.

## Output
A table per format plus a summary: net revenue, total cost, profit/loss, break-even units, recommended advance ceiling, and recommended initial print run.

## Pitfalls
- Never treat shipped units as sold units.
- Remember the timing: costs arrive months before cash (see the cash-flow-capital-planning skill).
- Don't let a big subsidiary-rights hope justify an advance on its own.
