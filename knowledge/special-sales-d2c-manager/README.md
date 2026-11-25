# Knowledge folder: Special Sales & Direct-to-Consumer Manager (Tessa)

The `special-sales-d2c-manager` agent reads everything in this folder **before every answer**. Put documents here that only this expert needs. Shared research belongs in `docs/`.

## What belongs here
- Special-sales prospect lists (museums, gift shops, corporate buyers)
- Bulk-order quotes and terms
- Shopify store metrics and promotions
- Event sales results

## How to add documents
- Use Markdown (`.md`), plain text, or CSV where possible. PDFs and spreadsheets also work, but text is faster and more reliable.
- Name files clearly with a date, e.g. `2026-11-20-distributor-proposal-ipg.md`.
- Put a one-line source and date at the top of each document.
- Move outdated or test files into an `archive/` subfolder. Agents, the SDK script and the web app all skip it.
- **Don't store secrets** (passwords, API keys, bank or tax IDs). This folder is committed to GitHub.
