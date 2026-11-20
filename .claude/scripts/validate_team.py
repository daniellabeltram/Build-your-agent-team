#!/usr/bin/env python3
"""Validate the expert team in .claude/agents and .claude/skills.

Run from the repository root:  python3 .claude/scripts/validate_team.py
Exits non-zero if any error is found. Warnings don't fail the run.
"""
import os, re, sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
AG = os.path.join(ROOT, ".claude", "agents")
SK = os.path.join(ROOT, ".claude", "skills")
ROUTING = os.path.join(SK, "expert-team-routing", "SKILL.md")
NAME_RE = re.compile(r"^[a-z0-9][a-z0-9-]*$")
AGENT_FIELDS = {"name", "description", "tools", "disallowedTools", "model", "permissionMode", "mcpServers",
                "hooks", "maxTurns", "autoCompactWindow", "skills", "initialPrompt", "memory", "effort",
                "background", "omitClaudeMd", "isolation", "color", "experimental"}
SKILL_FIELDS = {"name", "description", "when_to_use", "argument-hint", "arguments", "disable-model-invocation",
                "user-invocable", "allowed-tools", "disallowed-tools", "model", "effort", "context", "agent",
                "background", "hooks", "paths", "shell", "metadata", "license", "compatibility"}
errors, warnings = [], []

try:
    import yaml
except ImportError:
    print("PyYAML is required: pip install pyyaml"); sys.exit(2)

def frontmatter(path):
    text = open(path, encoding="utf-8").read()
    if not text.startswith("---\n"):
        errors.append(f"{path}: frontmatter must start on line 1"); return {}, text
    try:
        _, fm, body = text.split("---\n", 2)
        data = yaml.safe_load(fm) or {}
    except Exception as e:
        errors.append(f"{path}: YAML parse error: {e}"); return {}, text
    return data, body

def as_list(v):
    if v is None: return []
    if isinstance(v, str): return [x.strip() for x in v.split(",") if x.strip()]
    return list(v)

# Skills
skills = {}
for d in sorted(os.listdir(SK)) if os.path.isdir(SK) else []:
    p = os.path.join(SK, d, "SKILL.md")
    if not os.path.isfile(p):
        errors.append(f"skills/{d}: missing SKILL.md"); continue
    m, body = frontmatter(p)
    skills[d] = m
    if not NAME_RE.match(d): errors.append(f"skills/{d}: directory name must be lowercase-kebab")
    if m.get("name") not in (None, d): warnings.append(f"skills/{d}: name '{m.get('name')}' differs from directory")
    if not m.get("description"): errors.append(f"skills/{d}: missing description")
    elif len(str(m.get("description", "")) + str(m.get("when_to_use", ""))) > 1536:
        warnings.append(f"skills/{d}: description + when_to_use exceeds 1,536 chars (will be truncated)")
    for k in m:
        if k not in SKILL_FIELDS: errors.append(f"skills/{d}: unknown frontmatter field '{k}'")
    if body.count("\n") > 500: warnings.append(f"skills/{d}: SKILL.md over 500 lines")

# Agents
agents, used = {}, {}
for fn in sorted(os.listdir(AG)) if os.path.isdir(AG) else []:
    if not fn.endswith(".md"): continue
    p = os.path.join(AG, fn)
    m, body = frontmatter(p)
    n = m.get("name")
    if not n: errors.append(f"agents/{fn}: missing name"); continue
    if not NAME_RE.match(n) or ":" in n: errors.append(f"agents/{fn}: invalid name '{n}'")
    if n in agents: errors.append(f"agents/{fn}: duplicate name '{n}'")
    if not m.get("description"): errors.append(f"agents/{fn}: missing description")
    for k in m:
        if k not in AGENT_FIELDS: errors.append(f"agents/{fn}: unknown frontmatter field '{k}'")
    sk = as_list(m.get("skills"))
    if len(sk) > 32: errors.append(f"agents/{fn}: more than 32 preloaded skills (only first 32 load)")
    for s in sk:
        if s not in skills: errors.append(f"agents/{fn}: preloads missing skill '{s}'")
        elif str(skills[s].get("disable-model-invocation", "")).lower() in ("true", "yes", "on", "1"):
            errors.append(f"agents/{fn}: skill '{s}' sets disable-model-invocation and can't be preloaded")
        used.setdefault(s, []).append(n)
    if len(body.strip()) < 200: warnings.append(f"agents/{fn}: system prompt looks very short")
    if m.get("model") not in ("opus", "sonnet", "haiku", "fable", "inherit") and not str(m.get("model", "")).startswith("claude-"):
        errors.append(f"agents/{fn}: model must be set (opus/sonnet/haiku), got {m.get('model')!r}")
    kdir = os.path.join(ROOT, "knowledge", n)
    if not os.path.isfile(os.path.join(kdir, "README.md")):
        errors.append(f"agents/{fn}: missing knowledge/{n}/README.md")
    if f"knowledge/{n}/" not in body:
        errors.append(f"agents/{fn}: prompt doesn't tell the agent to read knowledge/{n}/")
    if "## Personality" not in body:
        errors.append(f"agents/{fn}: missing Personality section")
    agents[n] = m

# Forked skills must point to existing agents
for d, m in skills.items():
    if m.get("context") == "fork" and m.get("agent") and m["agent"] not in agents:
        errors.append(f"skills/{d}: agent '{m['agent']}' not found")
    meta_used = (m.get("metadata") or {}).get("used-by")
    if isinstance(meta_used, list) and d in used and sorted(meta_used) != sorted(used[d]):
        warnings.append(f"skills/{d}: metadata.used-by {sorted(meta_used)} != actual {sorted(used[d])}")
    invocable = str(m.get("disable-model-invocation", "")).lower() in ("true", "yes", "on", "1") or m.get("context") == "fork"
    if d not in used and not invocable:
        warnings.append(f"skills/{d}: not preloaded by any agent")

# Routing table must mention every agent
if os.path.isfile(ROUTING):
    rt = open(ROUTING, encoding="utf-8").read()
    for n in agents:
        if f"`{n}`" not in rt: errors.append(f"expert-team-routing: agent '{n}' is not listed")
    for ref in set(re.findall(r"`([a-z0-9-]+)`", rt)):
        if ref.endswith("-") or ref in skills: continue
        if "-" in ref and ref not in agents and ref not in ("roster-id",):
            warnings.append(f"expert-team-routing: references unknown agent '{ref}'")
else:
    errors.append("expert-team-routing skill is missing")

for d in sorted(os.listdir(os.path.join(ROOT, "knowledge"))) if os.path.isdir(os.path.join(ROOT, "knowledge")) else []:
    if os.path.isdir(os.path.join(ROOT, "knowledge", d)) and d not in agents:
        warnings.append(f"knowledge/{d}: no agent with this name")

if not 10 <= len(agents) <= 50:
    errors.append(f"team size {len(agents)} is outside the 10-50 target")

print(f"Agents: {len(agents)}  Skills: {len(skills)}")
for w in warnings: print("WARN ", w)
for e in errors: print("ERROR", e)
print("OK" if not errors else f"{len(errors)} error(s)")
sys.exit(1 if errors else 0)
