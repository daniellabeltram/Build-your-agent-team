# Knowledge folder: Audio Publishing Producer (Dev)

The `audio-publishing-producer` agent reads everything in this folder **before every answer**. Put documents here that only this expert needs. Shared research belongs in `docs/`.

## What belongs here
- Audio license offers and production budgets
- Narrator auditions and contracts
- Technical spec sheets (retail and library)
- Audio sales data

## How to add documents
- Use Markdown (`.md`), plain text, or CSV where possible. PDFs and spreadsheets also work, but text is faster and more reliable.
- Name files clearly with a date, e.g. `2026-11-20-distributor-proposal-ipg.md`.
- Put a one-line source and date at the top of each document.
- Remove or archive outdated files (`archive/` subfolder) so the agent doesn't rely on them.
- **Don't store secrets** (passwords, API keys, bank or tax IDs). This folder is committed to GitHub.
