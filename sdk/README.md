# Ask Celeste from the command line (Claude Agent SDK)

`ask-celeste.mjs` loads **Celeste**, the `fundraising-investor-advisor` agent in `../.claude/agents/`, together with every text file in her knowledge folder, `../knowledge/fundraising-investor-advisor/`. It asks her the question you pass on the command line and prints her answer.

It uses the [Claude Agent SDK](https://code.claude.com/docs/en/agent-sdk/overview) (`@anthropic-ai/claude-agent-sdk`). The session runs in the project root with `settingSources: ["project"]`, so Claude Code loads the project's agents, skills and `CLAUDE.md`. The `agent: "fundraising-investor-advisor"` option runs Celeste as the main agent (the same as `claude --agent fundraising-investor-advisor`), so her system prompt, tools and model (`opus`) apply.

## Requirements
- Node.js 18 or later
- An Anthropic API key from https://platform.claude.com (billed to your API account)

## 1. Install
From the repository root:
```bash
cd sdk
```
```bash
npm install
```

## 2. Set your API key
macOS / Linux:
```bash
export ANTHROPIC_API_KEY="your-api-key"
```
Windows PowerShell:
```powershell
$env:ANTHROPIC_API_KEY = "your-api-key"
```
Don't commit the key or paste it into files in this repo.

## 3. Check that Celeste loads (no API call, no key needed)
```bash
node ask-celeste.mjs --check
```
This prints her model, tools, skills and knowledge files. It then starts an SDK session, confirms that Claude Code loaded `fundraising-investor-advisor`, and ends with `CHECK PASSED`.

## 4. Ask her a question
```bash
node ask-celeste.mjs "How much should we raise in our first round, and from whom?"
```
The answer goes to standard output. Status and cost lines go to standard error, so you can save just the answer:
```bash
node ask-celeste.mjs "Draft a 10-slide pitch deck outline for Palm Beach angels" > celeste-answer.md
```

### Let her save files
By default Celeste can only read files and search the web. Anything else is denied without a prompt (`permissionMode: "dontAsk"`). To let her write files and run Bash, for example to save a spreadsheet model under `work/fundraising-investor-advisor/`, add `--allow-files`:
```bash
node ask-celeste.mjs --allow-files "Build a 36-month cash model for a $500k raise and save it as a spreadsheet"
```

## Notes
- **Knowledge folder:** every `.md`, `.txt`, `.csv`, `.json` and `.yaml` file in `knowledge/fundraising-investor-advisor/` is attached to the question, except files in `archive/`. Add or remove files there to change what she knows. Her agent instructions also tell her to read the folder herself.
- **Cost:** Celeste runs on Opus. A typical answer with some web research costs cents to a few dollars, and the script prints the cost when it finishes. `maxTurns` is capped at 30.
- **Other agents:** change `AGENT` at the top of the script to any name in `.claude/agents/` (e.g. `finance-capital-planner`) to ask a different expert.
