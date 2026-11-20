# Knowledge folder: Fundraising & Investor Relations Advisor (Celeste)

The `fundraising-investor-advisor` agent reads everything in this folder **before every answer**. Put documents here that only this expert needs. Shared research belongs in `docs/`.

## What belongs here
- Pitch deck and investor memo versions
- Investor pipeline and meeting notes
- Term sheets and loan offers
- Grant opportunities and applications

## How to add documents
- Use Markdown (`.md`), plain text, or CSV where possible. PDFs and spreadsheets also work, but text is faster and more reliable.
- Name files clearly with a date, e.g. `2026-11-20-distributor-proposal-ipg.md`.
- Put a one-line source and date at the top of each document.
- Remove or archive outdated files (`archive/` subfolder) so the agent doesn't rely on them.
- **Don't store secrets** (passwords, API keys, bank or tax IDs). This folder is committed to GitHub.
