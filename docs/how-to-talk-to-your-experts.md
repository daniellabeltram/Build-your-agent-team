# How to Talk to Your Experts

[← Index](README.md) · Team overview: [CLAUDE.md](../CLAUDE.md) · Roles and skills: [expert-roster.md](expert-roster.md)

There are three ways to use the team:

| You want… | Use | What happens |
|---|---|---|
| One combined answer from several experts | `/ask-the-team <question>` or "Use the orchestrator agent to…" | The orchestrator picks a panel, briefs the experts in parallel, runs a collaboration round, and returns one answer |
| One expert's view | "Use the `<agent-name>` agent to…" or @-mention the agent | Only that expert answers, in the standard format |
| A change to the team itself | `/evolve-team <request>` | The team-architect creates or improves agents and skills |

---

## 1. Example prompts that bring several experts together

Paste any of these into Claude Code from this project. Each one starts with `/ask-the-team`, so it goes straight to the orchestrator.

### Example A: Go / no-go and capital plan
```
/ask-the-team Should we launch in Fall 2027 with 5 titles across two imprints (Florida regional nonfiction and business/finance)? Give me a go/no-go recommendation, the total capital we need for 36 months with a 6-month buffer, the biggest three risks, and what we must have in place 12 months before launch.
```
**Likely panel:** publishing-strategy-advisor, finance-capital-planner, sales-distribution-manager, market-competitive-analyst, risk-insurance-advisor.
**Why they coordinate:** finance has to price the strategy's title ramp, and risk tests the cash plan. Distribution timing changes when cash arrives.

### Example B: Acquiring a specific book
```
/ask-the-team A Palm Beach hedge-fund founder wants us to publish a memoir-style leadership book that names former colleagues. The agent is asking for a $40,000 advance for World English rights. Should we acquire it, at what advance, and with which contract protections? Include a title P&L, a sales and audio/rights outlook, and the legal risks.
```
**Likely panel:** editorial-acquisitions-director, finance-capital-planner, media-law-counsel, publishing-contracts-attorney, subsidiary-rights-specialist, sales-distribution-manager.
**Why they coordinate:** the P&L sets the maximum advance, the libel review can change the scope of the book, and the contract terms must cover both.

### Example C: Launch plan for a lead title
```
/ask-the-team Build the launch plan for our first lead title: an upmarket Florida-set thriller publishing in November (Miami Book Fair month). Marketing budget is $20,000. I want a timeline from 9 months out to 3 months after publication, the budget split by channel, local Palm Beach events, trade and library sell-in steps, and the KPIs that tell us whether to reprint.
```
**Likely panel:** brand-marketing-strategist, publicity-community-relations-lead, digital-social-marketer, trade-library-marketing-specialist, special-sales-d2c-manager, sales-distribution-manager.
**Why they coordinate:** the channels compete for one $20k budget, and sell-in results drive the print-run and reprint decisions.

### Example D: Day-one setup in West Palm Beach
```
/ask-the-team What exactly do we need to set up in the first 90 days to operate legally and run lean in West Palm Beach: entity and filings, tax registrations, first two hires, office vs. coworking, core software, and insurance? Give me an ordered checklist with owners, costs, and deadlines, plus a hurricane-season continuity plan.
```
**Likely panel:** florida-compliance-advisor, royalties-accounting-tax-specialist, talent-org-advisor, operations-continuity-manager, publishing-technology-architect, risk-insurance-advisor.
**Why they coordinate:** hiring triggers payroll and insurance obligations, the office decision changes the zoning and tax-receipt steps, and the software choice affects continuity.

**Tips for good multi-expert prompts:**
- Say what **decision** the answer supports and give your **constraints** (budget, dates, title count).
- Ask for specific **deliverables** (checklist, P&L, timeline, recommendation). Experts save larger files under `work/<agent-name>/`.
- To follow up, ask the orchestrator to "re-run with a $750k capital cap" or "bring in the audio producer too."

---

## 2. Asking one specific expert

Name the agent in plain language, or @-mention it. Agent names are listed in [CLAUDE.md](../CLAUDE.md).

```
Use the finance-capital-planner agent to build a title P&L for a $28 hardcover with a 3,000-copy first printing and a $10,000 advance. Tell me the break-even units and the maximum advance you'd recommend.
```
```
@florida-compliance-advisor What do we need from Palm Beach County and the City of West Palm Beach before we can operate from a home office?
```
```
Use the brand-marketing-strategist agent to propose 10 names for the house and 3 imprints, avoiding anything that sounds like Penguin Random House, and say which ones need trademark clearance first.
```

A single expert stays in its own domain. If your question needs someone else, the expert's answer lists them under **Handoffs**. Either ask that expert next, or send the whole question to `/ask-the-team`.

---

## 3. Asking the whole team

Any of these routes a question to the orchestrator, which decides which experts it needs:

```
/ask-the-team What are the five decisions we must make first, in what order, and why?
```
```
Use the orchestrator agent to review our docs/ research end to end and tell me where the experts disagree with it or think it's out of date.
```
For a dedicated session where every message goes through the orchestrator:
```bash
claude --agent orchestrator
```

**Notes**
- "The whole team" means the orchestrator brings in **every expert the question needs**, not all 25 at once. That keeps answers fast and focused. If you really want every expert, say so ("consult every expert").
- For engagement status, plans, and decision logs, ask the `engagement-coordinator`.
- To add an expert (e.g. a Spanish-language imprint editor), use `/evolve-team Add an expert for a bilingual Spanish children's imprint`.
