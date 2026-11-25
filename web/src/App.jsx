import { useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import team from "./generated/team.json";
import { getSetup, runJob } from "./api.js";

const TEAM = "__team__";
const byName = Object.fromEntries(team.agents.map((a) => [a.name, a]));
const orchestrator = byName.orchestrator;

// Per-browser conveniences only; storage can be unavailable (private windows, blocked storage).
const store = {
  get(key, fallback) { try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; } },
  set(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* ignore */ } },
};

const Markdown = ({ children }) => (
  <div className="md"><ReactMarkdown remarkPlugins={[remarkGfm]}>{children}</ReactMarkdown></div>
);

function ModelBadge({ model }) {
  return <span className={`badge badge-${model}`} title={`Model: ${model}`}>{model}</span>;
}

function Sidebar({ selected, onSelect, open, onClose }) {
  const [filter, setFilter] = useState("");
  const groups = useMemo(() => {
    const f = filter.trim().toLowerCase();
    const list = team.agents.filter((a) => a.name !== "orchestrator" && (!f ||
      [a.firstName, a.title, a.name, a.voice, a.domain].join(" ").toLowerCase().includes(f)));
    return team.domains.map((d) => [d, list.filter((a) => a.domain === d)]).filter(([, l]) => l.length);
  }, [filter]);

  return (
    <aside className={`sidebar ${open ? "open" : ""}`}>
      <div className="sidebar-head">
        <h1>Your expert team</h1>
        <button className="icon-btn only-mobile" onClick={onClose} aria-label="Close menu">✕</button>
      </div>
      <button className={`team-btn ${selected === TEAM ? "active" : ""}`} onClick={() => onSelect(TEAM)}>
        <span className="avatar team-avatar">★</span>
        <span className="team-btn-text">
          <strong>Ask the whole team</strong>
          <small>{orchestrator?.firstName} (orchestrator) picks the experts and combines their answers</small>
        </span>
      </button>
      <input className="filter" placeholder="Filter experts…" value={filter} onChange={(e) => setFilter(e.target.value)} aria-label="Filter experts" />
      <nav>
        {groups.map(([domain, list]) => (
          <section key={domain}>
            <h2>{domain}</h2>
            {list.map((a) => (
              <button key={a.name} className={`agent ${selected === a.name ? "active" : ""}`} onClick={() => onSelect(a.name)}>
                <span className={`avatar c-${a.color}`}>{a.firstName[0]}</span>
                <span className="agent-text">
                  <span className="agent-line"><strong>{a.firstName}</strong><ModelBadge model={a.model} /></span>
                  <small className="agent-title">{a.title}</small>
                  <small className="agent-voice">{a.voice}</small>
                </span>
              </button>
            ))}
          </section>
        ))}
      </nav>
      <p className="built">Team loaded from the repo at build time ({new Date(team.builtAt).toLocaleDateString()})</p>
    </aside>
  );
}

function ChatHeader({ selected, collaborate, setCollaborate, onMenu, onClear, hasMessages }) {
  const a = selected === TEAM ? null : byName[selected];
  return (
    <header className="chat-head">
      <button className="icon-btn only-mobile" onClick={onMenu} aria-label="Open menu">☰</button>
      {a ? (
        <div className="who">
          <div className="who-line"><span className={`avatar c-${a.color}`}>{a.firstName[0]}</span>
            <div><h2>{a.firstName} <span className="muted">· {a.title}</span> <ModelBadge model={a.model} /></h2>
              <p className="persona"><em>{a.voice}</em> {a.style}</p></div></div>
          <details className="kfiles"><summary>Knowledge folder ({a.knowledgeFiles.length} file{a.knowledgeFiles.length === 1 ? "" : "s"})</summary>
            <ul>{a.knowledgeFiles.map((f) => <li key={f}><code>knowledge/{a.name}/{f}</code></li>)}</ul></details>
        </div>
      ) : (
        <div className="who">
          <div className="who-line"><span className="avatar team-avatar">★</span>
            <div><h2>The whole team <span className="muted">· via {orchestrator?.firstName}, the orchestrator</span> <ModelBadge model={orchestrator?.model} /></h2>
              <p className="persona">{orchestrator?.firstName} picks the right experts, briefs them in parallel, runs a collaboration round, and returns one combined answer. This takes a few minutes.</p></div></div>
          <label className="toggle"><input type="checkbox" checked={collaborate} onChange={(e) => setCollaborate(e.target.checked)} /> Collaboration round (better answers, slower and costlier)</label>
        </div>
      )}
      {hasMessages && <button className="link-btn" onClick={onClear}>Clear chat</button>}
    </header>
  );
}

function ExpertNotes({ job }) {
  const entries = Object.entries(job?.experts ?? {});
  if (!entries.length) return null;
  return (
    <details className="notes">
      <summary>Expert notes ({entries.length})</summary>
      {entries.map(([name, e]) => (
        <details key={name} className="note">
          <summary>{e.firstName} · {e.title}{e.error ? " (failed)" : ""}</summary>
          {e.error ? <p className="error-text">{e.error}</p> : <Markdown>{e.round1}</Markdown>}
          {e.round2 && <><h4>Round 2 (collaboration)</h4><Markdown>{e.round2}</Markdown></>}
        </details>
      ))}
    </details>
  );
}

function Message({ m }) {
  if (m.role === "user") return <div className="msg user"><div className="bubble">{m.content}</div></div>;
  const who = m.contributors?.[0];
  return (
    <div className={`msg assistant ${m.error ? "is-error" : ""}`}>
      <div className="bubble">
        {m.error ? <p className="error-text">{m.content}</p> : <Markdown>{m.content}</Markdown>}
        {who && <p className="meta">
          {m.mode === "team" ? `Combined by ${who.firstName} · experts: ${m.contributors.slice(1).map((c) => c.firstName).join(", ")}` : `${who.firstName} · ${who.model}`}
        </p>}
        {m.mode === "team" && <ExpertNotes job={m} />}
      </div>
    </div>
  );
}

function Progress({ job, who }) {
  const steps = job?.steps ?? [];
  return (
    <div className="msg assistant">
      <div className="bubble progress">
        <p><span className="dots" aria-hidden="true" /> {steps.at(-1)?.label ?? `Sending to ${who}…`}</p>
        {steps.length > 1 && <ol>{steps.slice(0, -1).map((s, i) => <li key={i}>{s.label}</li>)}</ol>}
        <ExpertNotes job={job} />
      </div>
    </div>
  );
}

export default function App() {
  const [selectedRaw, setSelected] = useState(() => store.get("selected", TEAM));
  const selected = selectedRaw === TEAM || byName[selectedRaw] ? selectedRaw : TEAM;
  const [chats, setChats] = useState(() => store.get("chats", {}));
  const [pending, setPending] = useState({});
  const [input, setInput] = useState("");
  const [collaborate, setCollaborate] = useState(() => store.get("collaborate", true));
  const [password, setPassword] = useState(() => store.get("password", ""));
  const [setup, setSetup] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const endRef = useRef(null);

  useEffect(() => { getSetup().then(setSetup); }, []);
  useEffect(() => store.set("chats", chats), [chats]);
  useEffect(() => store.set("selected", selected), [selected]);
  useEffect(() => store.set("collaborate", collaborate), [collaborate]);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chats, pending, selected]);

  const messages = chats[selected] ?? [];
  const job = pending[selected];
  const who = selected === TEAM ? "the team" : byName[selected]?.firstName;

  async function send(e) {
    e?.preventDefault();
    const text = input.trim();
    if (!text || job) return;
    const key = selected;
    const history = [...(chats[key] ?? []).filter((m) => !m.error), { role: "user", content: text }];
    setChats((c) => ({ ...c, [key]: [...(c[key] ?? []), { role: "user", content: text }] }));
    setInput("");
    setPending((p) => ({ ...p, [key]: { steps: [] } }));
    try {
      const done = await runJob({
        mode: key === TEAM ? "team" : "agent",
        agent: key === TEAM ? undefined : key,
        messages: history.map(({ role, content }) => ({ role, content })),
        collaborate,
        password,
      }, (j) => setPending((p) => ({ ...p, [key]: j })));
      setChats((c) => ({ ...c, [key]: [...(c[key] ?? []), {
        role: "assistant", content: done.answer, mode: done.mode, contributors: done.contributors,
        experts: done.mode === "team" ? done.experts : undefined,
      }] }));
    } catch (err) {
      if (err.code === "unauthorized") setSetup((s) => ({ ...s, passwordRequired: true, wrongPassword: true }));
      setChats((c) => ({ ...c, [key]: [...(c[key] ?? []), { role: "assistant", error: true, content: err.message }] }));
    } finally {
      setPending((p) => { const n = { ...p }; delete n[key]; return n; });
    }
  }

  const examples = selected === TEAM
    ? ["Should we launch in Fall 2027 with 5 titles? How much capital do we need?", "What must we set up in the first 90 days in West Palm Beach?"]
    : ["What should I be asking you first?", `What are the top three decisions in your area for this venture?`];

  return (
    <div className="app">
      <Sidebar selected={selected} onSelect={(s) => { setSelected(s); setMenuOpen(false); }} open={menuOpen} onClose={() => setMenuOpen(false)} />
      {menuOpen && <div className="scrim only-mobile" onClick={() => setMenuOpen(false)} />}
      <main className="chat">
        <ChatHeader selected={selected} collaborate={collaborate} setCollaborate={setCollaborate}
          onMenu={() => setMenuOpen(true)} hasMessages={messages.length > 0 && !job}
          onClear={() => setChats((c) => ({ ...c, [selected]: [] }))} />

        {setup && setup.ok === false && <div className="banner">Can't reach the Netlify Functions. Run the site with <code>netlify dev</code> locally, or deploy it to Netlify.</div>}
        {setup?.ok && !setup.keyConfigured && <div className="banner">ANTHROPIC_API_KEY isn't set in Netlify yet. Add it under Site configuration → Environment variables, then redeploy.</div>}
        {setup?.passwordRequired && (
          <div className="banner pw">
            <label>{setup.wrongPassword ? "Wrong password. Try again:" : "Access password:"}{" "}
              <input type="password" value={password} onChange={(e) => { setPassword(e.target.value); store.set("password", e.target.value); setSetup((s) => ({ ...s, wrongPassword: false })); }} /></label>
          </div>
        )}

        <div className="messages">
          {!messages.length && !job && (
            <div className="empty">
              <p>Ask {who} anything about the West Palm Beach publishing venture.</p>
              <div className="examples">{examples.map((q) => <button key={q} onClick={() => setInput(q)}>{q}</button>)}</div>
            </div>
          )}
          {messages.map((m, i) => <Message key={i} m={m} />)}
          {job && <Progress job={job} who={who} />}
          <div ref={endRef} />
        </div>

        <form className="composer" onSubmit={send}>
          <textarea value={input} onChange={(e) => setInput(e.target.value)} rows={2}
            placeholder={job ? `Waiting for ${who}…` : `Message ${who}… (Enter to send, Shift+Enter for a new line)`}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) send(e); }} disabled={Boolean(job)} />
          <button type="submit" disabled={!input.trim() || Boolean(job)}>Send</button>
        </form>
        <p className="fineprint">Answers are advisory. Confirm legal, tax and securities points with licensed Florida professionals.</p>
      </main>
    </div>
  );
}
