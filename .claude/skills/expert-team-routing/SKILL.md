---
name: expert-team-routing
description: 'Routing table for the publishing-venture expert team: which agent owns which topic, and standard panels for common question types. Use when deciding which experts to consult for a question.'
user-invocable: false
metadata:
  roster-id: S37
  used-by:
  - engagement-coordinator
  - orchestrator
  - team-architect
---

# Expert team routing

*Infrastructure skill S37. Preloaded into `orchestrator`, `engagement-coordinator`, `team-architect`. Keep this table in sync with `.claude/agents/` (the validator checks it).*

## Experts
| Agent | Domain | Owns |
|---|---|---|
| `engagement-coordinator` | Coordination | Orchestrates the expert team, routes questions to the right agent, reconciles conflicting advice, and delivers integrated recommendations to the consultant. |
| `publishing-strategy-advisor` | Business | Defines the business model, imprint strategy, title volume, and phased growth path for a PRH-style independent house. |
| `market-competitive-analyst` | Business | Sizes the market, tracks industry data and trends, and profiles Big Five, independent, and Florida competitors. |
| `editorial-acquisitions-director` | Business | Sets acquisition criteria, evaluates manuscripts, shapes each imprint's list, and builds agent and author pipelines. |
| `subsidiary-rights-specialist` | Business | Maximizes revenue from translation, film/TV, audio, book-club, paperback, and other rights licensing. |
| `sales-distribution-manager` | Business | Selects and manages the distributor and wholesale channels (Amazon, B&N, indies, libraries) and owns sell-in, sell-through, and returns. |
| `special-sales-d2c-manager` | Business | Builds high-margin non-trade channels: museums, gift shops, corporate bulk sales, events, and the publisher's own e-commerce store. |
| `production-manufacturing-manager` | Technical | Runs editorial-to-print workflow, schedules, printer and paper sourcing, offset vs. print-on-demand decisions, and freight. |
| `digital-publishing-metadata-specialist` | Technical | Owns ISBNs, BISAC codes, ONIX feeds, and accessible EPUB 3 ebook production so every title is discoverable and compliant. |
| `audio-publishing-producer` | Technical | Advises on producing audiobooks in-house vs. licensing audio rights, and manages narration, production, and distribution. |
| `publishing-technology-architect` | Technical | Designs the tech stack: title management, royalty software, website/Shopify store, author portal, and integrations. |
| `ai-emerging-tech-advisor` | Technical | Sets AI policy (author warranties, AI-training licensing, internal AI use) and evaluates AI's threat and opportunity for the house. |
| `operations-continuity-manager` | Operations | Plans office/coworking in West Palm Beach, vendor management, remote-first operations, and hurricane-season continuity. |
| `talent-org-advisor` | Operations | Designs the org chart and phased hiring plan, sets compensation, and recruits editors, marketers, and staff. |
| `finance-capital-planner` | Finance | Builds title P&Ls, the 3-year financial model, cash-flow forecast (payment lags, returns reserves), and capital requirement. |
| `fundraising-investor-advisor` | Finance | Identifies and pitches funding sources (founder, Palm Beach angels/family offices, SBA loans, grants, nonprofit imprint). |
| `royalties-accounting-tax-specialist` | Finance | Sets up bookkeeping, royalty accounting and statements, 1099 reporting, sales-tax collection, and inventory accounting. |
| `publishing-contracts-attorney` | Legal | Drafts author, freelancer, translation, and audio agreements and protects copyrights and trademarks for the house and imprints. |
| `florida-compliance-advisor` | Legal | Guides entity formation, Sunbiz, county and city Business Tax Receipts, zoning, Florida DOR sales tax, and employer registrations. |
| `media-law-counsel` | Legal | Vets manuscripts for libel, privacy, and permissions risk and monitors Florida book-challenge law (HB 1069, PRH v. Gibson). |
| `brand-marketing-strategist` | Marketing | Creates the house and imprint brands, positioning against hybrids and the Big Five, and the overall marketing plan and budget. |
| `publicity-community-relations-lead` | Marketing | Secures media coverage and runs the local playbook: launch events, the luncheon circuit, Miami Book Fair, and Florida press. |
| `digital-social-marketer` | Marketing | Runs BookTok/Bookstagram, influencer seeding, newsletters, Amazon Ads, and BookBub campaigns and reports their ROI. |
| `trade-library-marketing-specialist` | Marketing | Drives sell-in through catalogs, Edelweiss/NetGalley ARCs, trade reviews, bookseller associations, and library outreach. |
| `risk-insurance-advisor` | Risk | Maintains the risk register, quantifies top risks, and specifies insurance (media liability, business interruption, cyber). |

## Routing rules
1. **Pick the smallest panel that covers the question.** That's usually 2–5 experts, and rarely more than 7.
2. **Money questions** (cost, price, advance, budget, funding): always include `finance-capital-planner`.
3. **Contracts, rights, names, or content risk:** include the relevant legal agent (`publishing-contracts-attorney`, `florida-compliance-advisor`, `media-law-counsel`).
4. **Go / no-go decisions and plans:** add `risk-insurance-advisor` for a risk check.
5. **Anything consumer-facing:** route to `brand-marketing-strategist`, which brings in the publicity, digital, and trade/library specialists as needed.
6. **Questions about Florida or local specifics:** include an agent whose skills cover the Palm Beach network (`publicity-community-relations-lead`, `special-sales-d2c-manager`, `operations-continuity-manager`, `market-competitive-analyst`, `fundraising-investor-advisor`).
7. **Single-domain factual questions** go to one expert, with no panel.

## Standard panels
| Question type | Panel |
|---|---|
| "Should we launch / what's the plan?" | publishing-strategy-advisor, market-competitive-analyst, finance-capital-planner, sales-distribution-manager, risk-insurance-advisor |
| "How much money do we need?" | finance-capital-planner, fundraising-investor-advisor, publishing-strategy-advisor, talent-org-advisor, operations-continuity-manager |
| "Should we acquire this book / what advance?" | editorial-acquisitions-director, finance-capital-planner, sales-distribution-manager, subsidiary-rights-specialist, media-law-counsel |
| "How do we get into bookstores and libraries?" | sales-distribution-manager, trade-library-marketing-specialist, digital-publishing-metadata-specialist, finance-capital-planner |
| "Launch plan for a title" | brand-marketing-strategist, publicity-community-relations-lead, digital-social-marketer, trade-library-marketing-specialist, special-sales-d2c-manager |
| "What do we need to file / legally set up?" | florida-compliance-advisor, publishing-contracts-attorney, royalties-accounting-tax-specialist, risk-insurance-advisor |
| "Who do we hire and when?" | talent-org-advisor, finance-capital-planner, editorial-acquisitions-director, florida-compliance-advisor |
| "Name and brand the house / imprints" | brand-marketing-strategist, publishing-strategy-advisor, publishing-contracts-attorney, market-competitive-analyst |
| "What tech do we need?" | publishing-technology-architect, digital-publishing-metadata-specialist, royalties-accounting-tax-specialist, special-sales-d2c-manager |
| "What's our AI policy?" | ai-emerging-tech-advisor, publishing-contracts-attorney, media-law-counsel, audio-publishing-producer |
| "Audio strategy" | audio-publishing-producer, subsidiary-rights-specialist, finance-capital-planner |
| "Production and printing" | production-manufacturing-manager, sales-distribution-manager, finance-capital-planner |
| "Hurricane / continuity / insurance" | risk-insurance-advisor, operations-continuity-manager, florida-compliance-advisor |
| "Engagement status / next steps" | engagement-coordinator |

## Support agents (not experts)
| Agent | Use for |
|---|---|
| `orchestrator` | Multi-expert questions; returns one combined answer |
| `team-architect` | Creating or improving agents and skills |
