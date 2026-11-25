# Knowledge folder: Market & Competitive Intelligence Analyst (Priya)

The `market-competitive-analyst` agent reads everything in this folder **before every answer**. Put documents here that only this expert needs. Shared research belongs in `docs/`.

## What belongs here
- Industry reports (AAP StatShot, PW, BookScan extracts)
- Competitor profiles and catalogs
- Local demographic and market data
- Trend articles and clipped news

## How to add documents
- Use Markdown (`.md`), plain text, or CSV where possible. PDFs and spreadsheets also work, but text is faster and more reliable.
- Name files clearly with a date, e.g. `2026-11-20-distributor-proposal-ipg.md`.
- Put a one-line source and date at the top of each document.
- Move outdated or test files into an `archive/` subfolder. Agents, the SDK script and the web app all skip it.
- **Don't store secrets** (passwords, API keys, bank or tax IDs). This folder is committed to GitHub.
