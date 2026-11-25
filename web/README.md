# Expert Team web app

A React app for talking to the expert team in this repository:
- **Sidebar:** every agent, with its first name, role, personality (voice) and model (Opus, Sonnet or Haiku).
- **Chat window:** one conversation per expert. Each expert's header shows its working style and knowledge-folder files.
- **Ask the whole team:** routes your question through **Morgan, the orchestrator**. Morgan picks the experts, briefs them in parallel, runs an optional collaboration round, and returns one combined answer. You can expand each expert's notes underneath.

## How it works
| Piece | What it does |
|---|---|
| `scripts/build-team.mjs` | Runs automatically before every build. It reads `.claude/agents/`, `.claude/skills/`, `knowledge/<agent>/` and `docs/` from the repo, then generates the sidebar data and the agents' full prompts. |
| `netlify/functions/run.mjs` | A **background function** (`/api/run`, up to 15 minutes). It calls the Claude API with `ANTHROPIC_API_KEY` and saves progress to Netlify Blobs. |
| `netlify/functions/job.mjs` | `/api/job`. The browser polls it every few seconds for progress and the final answer. |
| `src/` | The React front end. It never sees your API key. |

Each expert's system prompt contains, in order: the shared research in `docs/` (cached once and reused across experts), the agent's own instructions and personality, its knowledge folder, and its preloaded skills. Models: Opus → `claude-opus-5-5`, Sonnet → `claude-sonnet-5-5`, Haiku → `claude-haiku-5-5`.

---

## Deploy to Netlify (step by step)

You need a Netlify account (free tier works), access to this GitHub repository, and an Anthropic API key from https://platform.claude.com.

1. **Sign in to Netlify** at https://app.netlify.com.
2. Click **Add new project → Import an existing project → GitHub**. Authorize Netlify for GitHub if asked. If the repository is private, grant Netlify access to it.
3. **Pick the repository** `Build-your-agent-team`, and pick the branch `main`.
4. **Leave the build settings as they are.** Netlify reads them from `netlify.toml` at the repo root (base directory `web`, build command `npm run build`, publish directory `dist`, functions `netlify/functions`). Don't type anything into those fields.
5. **Add your API key before the first deploy.** On the same screen, click **Add environment variables** (or after the import, go to **Project configuration → Environment variables → Add a variable**):
   - Key: `ANTHROPIC_API_KEY`
   - Value: your Anthropic API key
   - If offered, mark it **secret** and scope it to **Functions**.
6. **Strongly recommended: add a password.** Add a second variable, `ACCESS_PASSWORD`, set to a password of your choice. Without it, anyone who finds your site's URL can spend your API credits. The app asks for the password once and remembers it in that browser.
7. Click **Deploy**. The build takes about a minute.
8. **If you added the variables after the first deploy,** go to **Deploys → Trigger deploy → Deploy project** so the functions pick them up.
9. **Open your site URL** (e.g. `https://your-site.netlify.app`). The sidebar should list the team. If a yellow banner says the API key isn't set, recheck step 5 and redeploy.
10. **Test it:** click **Celeste** and ask "How much should we raise in our first round?" A single expert answers in roughly 15–90 seconds. "Ask the whole team" takes a few minutes.

### Updating the team
Change an agent, a skill, a knowledge folder or a doc in this repo and push to `main`. Netlify rebuilds automatically and picks up the changes, because the team is read at build time.

---

## Run it locally (optional)
Install the Netlify CLI once:
```bash
npm install -g netlify-cli
```
Install the app's dependencies:
```bash
cd web
```
```bash
npm install
```
Set your key for this terminal session (macOS/Linux):
```bash
export ANTHROPIC_API_KEY="your-api-key"
```
Start the app with its functions at http://localhost:8888:
```bash
netlify dev
```
`npm run dev` alone starts only the front end, without the functions.

Run the offline tests (no key needed):
```bash
npm run team && npm test
```

## Settings
| Environment variable | Required | Purpose |
|---|---|---|
| `ANTHROPIC_API_KEY` | Yes | Your Anthropic API key. Used only inside the Netlify Function. |
| `ACCESS_PASSWORD` | Recommended | A shared password every request must include. |
| `MODEL_OPUS`, `MODEL_SONNET`, `MODEL_HAIKU` | No | Override the model ID used for each brain. |
| `DISABLE_FALLBACKS` | No | Set to `1` to turn off server-side refusal fallbacks (on by default for Opus and Sonnet). |

## Costs and limits
- Each expert answer is one API call with a large system prompt (the research plus the agent's skills, roughly 30–45k tokens). Prompt caching makes repeat questions to the same expert much cheaper.
- "Ask the whole team" makes about 2 × panel size + 2 calls, so 6–12 calls for a 2–5 expert panel. Turn off the collaboration round to roughly halve that.
- Background functions can run for up to 15 minutes, which is plenty for a full team answer.

## Privacy
- Your API key stays in Netlify's environment and is never sent to the browser.
- Questions, answers, knowledge-folder contents and research are sent to the Anthropic API.
- Job progress is stored in Netlify Blobs under a random ID. Chat history is stored only in your browser (localStorage). Use **Clear chat** to remove it.

## Troubleshooting
| Symptom | Fix |
|---|---|
| "Can't reach the Netlify Functions" | You're on `npm run dev` or a static host. Use `netlify dev` or the deployed site. |
| "ANTHROPIC_API_KEY isn't set" | Add it (step 5), then redeploy (step 8). |
| "The background function didn't start" | Open **Logs → Functions → run** in Netlify. Check that the deploy finished and the functions built. |
| "Model not found" / "doesn't have access" | Your key's account lacks that model. Set `MODEL_OPUS` etc. to models you have. |
| Rate limited | Wait a minute. A team question makes several calls at once. |
