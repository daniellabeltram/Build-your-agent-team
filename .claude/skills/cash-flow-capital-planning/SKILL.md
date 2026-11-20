---
name: cash-flow-capital-planning
description: Forecast cash timing for a publishing house (advances, printing, distributor payment lags, returns reserves, seasonality) and size total capital and runway. Use when planning funding, budgets, hiring timing, or list growth.
metadata:
  roster-id: S06
  used-by:
  - finance-capital-planner
  - fundraising-investor-advisor
  - operations-continuity-manager
  - publishing-strategy-advisor
  - risk-insurance-advisor
---

# Cash-flow & capital planning

*Roster skill S06. Preloaded into: `finance-capital-planner`, `fundraising-investor-advisor`, `operations-continuity-manager`, `publishing-strategy-advisor`, `risk-insurance-advisor`.*

## Purpose
Publishers go broke on timing, not only on losses. This skill models when cash goes out and when it comes in.

## Key timing facts (docs/04, est.)
- Advances are paid on signing, delivery, and publication (often 1/3 each). Printing is paid 30–60 days after delivery.
- Distributors pay **60–120 days after sale** and hold a **returns reserve of 15–25%**.
- Sales concentrate in **Q4**, and the Palm Beach locals' season runs **Nov–Apr**. Cash troughs come in Q1–Q3.
- Year 1 operating spend is **≈ $390k–$1.0M**. The cumulative 3-year capital need is **$500k–$1.2M**.

## Method
1. Build a **monthly** 36-month schedule. List each title's cost events (advance tranches, freelance, print, marketing) by month.
2. Model revenue as orders → shipments → sell-through → returns, and cash as receipts after the distributor lag minus the reserve.
3. Layer in fixed costs: payroll (with a hiring plan), rent, software, insurance, and professional fees.
4. Compute monthly net cash flow, cumulative cash, the **lowest cash point**, and the month it happens.
5. Size capital = |lowest cumulative cash| + a 6-month safety buffer.
6. Run scenarios (base, downside, upside) and name the trigger points (e.g. "if cash < $X, delay the Fall list").
7. Recommend a funding tranche schedule that matches the burn.

## Output
Monthly cash table (or xlsx via the spreadsheet-financial-modeling skill), a capital requirement with buffer, runway in months, and decision triggers.

## Pitfalls
- Forgetting that the returns reserve is released late.
- Assuming every title publishes on schedule. Slip at least 20% of titles by one season in the downside case.
