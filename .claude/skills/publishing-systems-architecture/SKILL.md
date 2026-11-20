---
name: publishing-systems-architecture
description: 'Select and integrate the publishing tech stack: title management/ONIX, royalty accounting software, design tools, website and Shopify store, author portal, CRM, and analytics. Use when planning systems, budgets for software, or integrations.'
metadata:
  roster-id: S20
  used-by:
  - operations-continuity-manager
  - publishing-technology-architect
  - royalties-accounting-tax-specialist
  - special-sales-d2c-manager
---

# Publishing systems & e-commerce architecture

*Roster skill S20. Preloaded into: `operations-continuity-manager`, `publishing-technology-architect`, `royalties-accounting-tax-specialist`, `special-sales-d2c-manager`.*

## Purpose
Run a lean house on cloud tools that connect to each other, and avoid spreadsheet chaos as the list grows.

## Reference stack (docs/04, est. $3k–$15k setup, $8k–$25k/yr)
| Need | Options (examples) | Notes |
|---|---|---|
| Title management & ONIX | Distributor portal (start), then dedicated title-management systems | One source of truth for metadata |
| Royalty accounting | Dedicated royalty software; spreadsheets only up to ~10 titles | Must handle reserves, escalators, sub-rights |
| Design / production | Adobe Creative Cloud (InDesign), Vellum for simple ebooks | |
| Accounting | QuickBooks Online / Xero + payroll (Gusto/ADP) | |
| Website + D2C store | Shopify (+ tax app), direct-download ebook/audio delivery app | |
| Email/newsletter | Klaviyo, Mailchimp, Substack | Per-imprint lists |
| CRM (agents, authors, media, special sales) | HubSpot free/Airtable | |
| Author portal | Royalty software portal, or Airtable/Softr | Real-time sales is a selling point |
| Files & collaboration | Google Workspace/Microsoft 365, cloud storage | Hurricane-resilient |

## Method
1. List the processes (acquire → contract → produce → metadata → sell → account royalties) and the data each one needs.
2. Choose the minimal tools per phase (Year 1 vs. Years 2–3). Avoid enterprise systems too early.
3. Define integrations and the system of record for each data type.
4. Estimate costs and implementation effort, and check security (SSO, backups, access).

## Output
An architecture diagram (described in text or Mermaid), tool shortlist with costs, data ownership table, and rollout plan.
