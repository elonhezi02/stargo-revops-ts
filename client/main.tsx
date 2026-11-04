import React, {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { createRoot } from "react-dom/client";
import {
  ArrowUpRight,
  BarChart3,
  Check,
  ChevronRight,
  Download,
  Inbox,
  Plus,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import type { Workspace, Lead, Trace, Claim } from "../shared/contracts";
import { Sources } from "../shared/contracts";
import "./styles.css";
const date = (v: string) =>
  new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Jerusalem",
  }).format(new Date(v));
async function api<T>(path: string, body?: unknown): Promise<T> {
  const r = await fetch(
    "/api" + path,
    body === undefined
      ? undefined
      : {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        },
  );
  if (!r.ok) {
    const e = await r.json();
    throw new Error(e.detail ?? "Request failed");
  }
  return r.json();
}
function Badge({ children }: { children: ReactNode }) {
  return (
    <span
      className={"badge " + String(children).replaceAll(" ", "-").toLowerCase()}
    >
      {children}
    </span>
  );
}
function Dialog({
  title,
  close,
  children,
}: {
  title: string;
  close: () => void;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const prior = document.activeElement as HTMLElement;
    ref.current?.showModal();
    return () => {
      ref.current?.close();
      prior?.focus();
    };
  }, []);
  return (
    <dialog
      ref={ref}
      onCancel={(e) => {
        e.preventDefault();
        close();
      }}
      aria-label={title}
    >
      <div className="dialog-title">
        <h2>{title}</h2>
        <button className="icon" onClick={close} aria-label="Close">
          <X />
        </button>
      </div>
      {children}
    </dialog>
  );
}
function App() {
  const [data, setData] = useState<Workspace | null>(null),
    [error, setError] = useState(""),
    [view, setView] = useState("queue"),
    [search, setSearch] = useState(""),
    [status, setStatus] = useState("All"),
    [selected, setSelected] = useState<string | null>(null),
    [adding, setAdding] = useState(false),
    [records, setRecords] = useState<{ title: string; rows: Trace[] } | null>(
      null,
    ),
    [busy, setBusy] = useState(false);
  const refresh = async () => {
    try {
      setData(await api<Workspace>("/workspace"));
    } catch (e) {
      setError((e as Error).message);
    }
  };
  useEffect(() => {
    void refresh();
  }, []);
  const run = async (fn: () => Promise<unknown>) => {
    setBusy(true);
    setError("");
    try {
      await fn();
      await refresh();
      return true;
    } catch (e) {
      setError((e as Error).message);
      return false;
    } finally {
      setBusy(false);
    }
  };
  if (!data)
    return (
      <main className="loading">
        <Sparkles />
        <h1>Revenue workspace</h1>
        <p>{error || "Loading local workspace…"}</p>
        {error && <button onClick={refresh}>Retry</button>}
      </main>
    );
  const lead = data.leads.find((l) => l.id === selected);
  const leads = data.leads.filter(
    (l) =>
      (status === "All" || l.status === status) &&
      `${l.name} ${l.company_name} ${l.email}`
        .toLowerCase()
        .includes(search.toLowerCase()),
  );
  return (
    <div className="shell">
      <aside>
        <a className="brand" href="/">
          stargo<span>REV OPS</span>
        </a>
        <div className="workspace-label">REVENUE WORKSPACE</div>
        <nav>
          {[
            ["queue", "Lead queue", Inbox],
            ["performance", "Weekly performance", BarChart3],
            ["visibility", "AI visibility", Sparkles],
          ].map(([id, label, Icon]) => {
            const I = Icon as typeof Inbox;
            return (
              <button
                key={String(id)}
                className={view === id ? "active" : ""}
                onClick={() => setView(String(id))}
              >
                <I size={19} />
                {String(label)}
              </button>
            );
          })}
        </nav>
        <div className="sidebar-footer">
          <span className="dot" /> Local workspace
          <p>
            Synthetic assignment data
            <br />
            Nothing is sent automatically.
          </p>
        </div>
      </aside>
      <div className="content">
        <header>
          <span>
            GTM OPERATIONS <ChevronRight size={13} />{" "}
            {view === "queue"
              ? "Lead queue"
              : view === "performance"
                ? "Performance"
                : "Visibility"}
          </span>
          <Badge>
            {data.provider === "rules" ? "Offline rules" : data.model}
          </Badge>
        </header>
        <main>
          <div className="page-heading">
            <div>
              <div className="eyebrow">
                {view === "queue"
                  ? "FROM SIGNAL TO CONVERSATION"
                  : view === "performance"
                    ? "4–8 OCTOBER 2026 · ISRAEL TIME"
                    : "HOW BUYERS DISCOVER STARGO"}
              </div>
              <h1>
                {view === "queue"
                  ? "Every signal. A clear next step."
                  : view === "performance"
                    ? "An honest view of the week."
                    : "Turn visibility gaps into answers."}
              </h1>
              <p>
                {view === "queue"
                  ? "Evidence-backed qualification, with people in control."
                  : view === "performance"
                    ? "Observed results, traceable to the decisions and events behind them."
                    : "A snapshot of 24 synthetic answers across three AI engines."}
              </p>
            </div>
            {view === "queue" ? (
              <button className="primary" onClick={() => setAdding(true)}>
                <Plus size={17} />
                New inbound
              </button>
            ) : view === "performance" ? (
              <a className="button" href="/api/kpi/export">
                <Download size={17} />
                Export pack
              </a>
            ) : null}
          </div>
          {error && (
            <div role="alert" className="notice error">
              {error}
              <button onClick={() => setError("")} aria-label="Dismiss error">
                <X size={16} />
              </button>
            </div>
          )}
          {view === "queue" && (
            <>
              <section className="stats">
                <Stat
                  label="Current qualified"
                  value={data.leads.filter((l) => l.status === "QL").length}
                  note="All five checks passed"
                />
                <Stat
                  label="Ready for sales review"
                  value={
                    data.leads.filter((l) => l.status === "QL candidate").length
                  }
                  note="Acceptance still required"
                />
                <Stat
                  label="Needs human review"
                  value={
                    data.leads.filter((l) => l.status === "needs review").length
                  }
                  note="No automatic qualification"
                />
                <Stat
                  label="Rejected input"
                  value={data.rejected.length}
                  note="Validation protected the queue"
                />
              </section>
              <section className="panel">
                <div className="toolbar">
                  <h2>
                    Lead queue <span>{leads.length}</span>
                  </h2>
                  <div className="filters">
                    <label className="search">
                      <Search size={16} />
                      <input
                        aria-label="Search leads"
                        placeholder="Search people or companies"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                      />
                    </label>
                    <select
                      aria-label="Filter status"
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                    >
                      {[
                        "All",
                        "QL",
                        "QL candidate",
                        "needs review",
                        "nurture",
                        "excluded",
                        "suppressed",
                        "disqualified",
                      ].map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="table-scroll">
                  <table>
                    <thead>
                      <tr>
                        <th>Person / company</th>
                        <th>Channel / received (Israel)</th>
                        <th>Priority</th>
                        <th>Status</th>
                        <th>Owner</th>
                        <th />
                      </tr>
                    </thead>
                    <tbody>
                      {leads.map((l) => (
                        <tr key={l.id}>
                          <td>
                            <button
                              className="person"
                              onClick={() => setSelected(l.id)}
                            >
                              {l.name}
                            </button>
                            <small>
                              {l.company_name || "Company not recorded"}
                            </small>
                          </td>
                          <td>
                            {l.messages.at(-1)?.channel.replaceAll("_", " ") ??
                              "CRM only"}
                            <small>
                              {l.messages.length
                                ? date(l.messages.at(-1)!.received_at)
                                : "No inbound evidence"}
                            </small>
                          </td>
                          <td>
                            <span
                              className={
                                "score " + (l.score >= 70 ? "high" : "")
                              }
                            >
                              {l.score}
                            </span>
                          </td>
                          <td>
                            <Badge>{l.status}</Badge>
                          </td>
                          <td>{l.owner ?? "—"}</td>
                          <td>
                            <button
                              className="icon"
                              aria-label={"Open " + l.name}
                              onClick={() => setSelected(l.id)}
                            >
                              <ArrowUpRight size={17} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {!leads.length && <p className="empty">No matching leads.</p>}
              </section>
              <details className="footnote">
                <summary>
                  Data hygiene · {data.rejected.length} rejected record
                </summary>
                {data.rejected.map((r) => (
                  <p key={r.id}>
                    {r.id}: {r.reason}
                  </p>
                ))}
              </details>
            </>
          )}
          {view === "performance" && (
            <>
              <div className="notice">
                Partial coverage: historical-reactivation feed was not received.
                Unknown is not zero.
              </div>
              <section className="stats">
                {data.pack.metrics.map((m) => (
                  <button
                    className="stat clickable"
                    key={m.key}
                    onClick={() =>
                      setRecords({ title: m.label, rows: m.records })
                    }
                  >
                    <span>{m.label}</span>
                    <strong>
                      {m.actual}
                      <em> / {m.target}</em>
                    </strong>
                    <div className="progress">
                      <i
                        style={{
                          width:
                            Math.min(100, (100 * m.actual) / m.target) + "%",
                        }}
                      />
                    </div>
                    <small>
                      View supporting records <ArrowUpRight size={12} />
                    </small>
                  </button>
                ))}
              </section>
              <div className="columns">
                <section className="panel">
                  <div className="toolbar">
                    <h2>Qualified leads by first touch</h2>
                  </div>
                  {data.pack.sources.map((s) => (
                    <button
                      className="list-row"
                      key={s.source}
                      onClick={() =>
                        setRecords({ title: s.source, rows: s.records })
                      }
                    >
                      <span>{s.source}</span>
                      <strong>{s.actual ?? "Unknown"}</strong>
                    </button>
                  ))}
                </section>
                <section className="panel">
                  <div className="toolbar">
                    <h2>Expansion, separately</h2>
                  </div>
                  {data.pack.expansion.map((m) => (
                    <button
                      className="list-row"
                      key={m.key}
                      onClick={() =>
                        setRecords({
                          title: "Expansion · " + m.label,
                          rows: m.records,
                        })
                      }
                    >
                      <span>
                        {m.key === "ql"
                          ? "Accepted expansion contacts"
                          : m.label}
                      </span>
                      <strong>{m.actual}</strong>
                    </button>
                  ))}
                  <p className="panel-note">
                    Meeting and opportunity dates determine the reporting week,
                    including earlier cohorts. A current sales decision does not
                    rewrite this historical week.
                  </p>
                </section>
              </div>
            </>
          )}
          {view === "visibility" && (
            <>
              <div className="notice">
                Score = priority / 3 × (40% missing mention + 30% missing owned
                citation + 20% flagged claims + 10% competitor presence). Each
                rate is measured across the three engines.
              </div>
              <section className="panel">
                <div className="toolbar">
                  <h2>Ranked visibility gaps</h2>
                </div>
                {data.gaps.map((g, i) => (
                  <details className="gap" key={g.id}>
                    <summary>
                      <span className="rank">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span>{g.question}</span>
                      <Badge>{g.score + " / 100"}</Badge>
                    </summary>
                    {g.answers.map((a) => (
                      <div className="answer" key={a.answer_id}>
                        <h3>
                          {a.engine}{" "}
                          <Badge>{a.mentioned ? "Mentioned" : "Missing"}</Badge>
                        </h3>
                        <p>{a.answer_text}</p>
                        <small>
                          Owned citation: {a.owned_citation ? "yes" : "no"} ·
                          Competitors: {a.competitors.join(", ") || "none"}
                        </small>
                        {a.warnings.map((w) => (
                          <p className="warning" key={w}>
                            {w}
                          </p>
                        ))}
                        <div>
                          {a.citations.map((u) => (
                            <a
                              key={u}
                              href={u}
                              target="_blank"
                              rel="noreferrer"
                            >
                              {u} ↗{" "}
                            </a>
                          ))}
                        </div>
                      </div>
                    ))}
                  </details>
                ))}
              </section>
              <section className="panel brief">
                <div className="toolbar">
                  <div>
                    <div className="eyebrow">TOP GAP · CONTENT OPPORTUNITY</div>
                    <h2>Grounded content brief</h2>
                  </div>
                  <button
                    className="primary"
                    disabled={busy}
                    onClick={() => run(() => api("/visibility/brief", {}))}
                  >
                    <Sparkles size={16} />
                    {busy ? "Generating…" : "Generate brief"}
                  </button>
                </div>
                {data.brief?.status === "ready" ? (
                  <>
                    <Badge>{data.brief.mode}</Badge>
                    <h2>{data.brief.title}</h2>
                    <Claims rows={data.brief.direct_answer!} />
                    <small>
                      {data.brief.word_count} words · schema.org/
                      {data.brief.schema_type} · Draft for human approval
                    </small>
                    <div className="columns">
                      {data.brief.sections?.map((s) => (
                        <section key={s.heading}>
                          <h3>{s.heading}</h3>
                          <Claims rows={s.claims} />
                        </section>
                      ))}
                    </div>
                    <h3>Frequently asked questions</h3>
                    {data.brief.faq?.map((q) => (
                      <section key={q.question}>
                        <h4>{q.question}</h4>
                        <Claims rows={q.claims} />
                      </section>
                    ))}
                    <p className="panel-note">
                      Proof points are illustrative and approved only for this
                      exercise. Every emitted factual sentence comes from the
                      approved claim catalog.
                    </p>
                  </>
                ) : (
                  <p>
                    {data.brief?.error ??
                      "Generate a brief for the highest-ranked question."}
                  </p>
                )}
              </section>
            </>
          )}
        </main>
        <footer>
          Stargo revenue workspace · Local, evidence-led, human-approved
        </footer>
      </div>
      {lead && (
        <Dialog title={lead.name} close={() => setSelected(null)}>
          <LeadDetail
            lead={lead}
            busy={busy}
            act={async (path, body) => {
              await run(() => api(path, body));
            }}
            error={error}
          />
        </Dialog>
      )}
      {adding && (
        <Dialog title="New inbound signal" close={() => setAdding(false)}>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget);
              const body = {
                from_name: f.get("name"),
                from_email: f.get("email") || null,
                linkedin_url: f.get("linkedin") || null,
                channel: f.get("channel"),
                source: f.get("source") || null,
                body: f.get("body"),
                ...(f.get("received")
                  ? { received_at: f.get("received") }
                  : {}),
              };
              if (await run(() => api("/leads", body))) setAdding(false);
            }}
          >
            <p className="muted">
              Use the same qualification pipeline as the seed data. Identity
              fields may be blank.
            </p>
            <label>
              Name
              <input name="name" required maxLength={200} />
            </label>
            <div className="columns">
              <label>
                Email
                <input name="email" type="email" />
              </label>
              <label>
                LinkedIn profile URL
                <input name="linkedin" type="url" />
              </label>
            </div>
            <div className="columns">
              <label>
                Channel
                <select name="channel">
                  <option value="form_fill">Form</option>
                  <option value="email_reply">Email reply</option>
                  <option value="linkedin_dm">LinkedIn DM</option>
                </select>
              </label>
              <label>
                First-touch source
                <select name="source">
                  <option value="">Not recorded</option>
                  {Sources.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </label>
            </div>
            <label>
              Received time (optional, ISO with offset)
              <input name="received" placeholder="2026-10-05T12:00:00+03:00" />
            </label>
            <label>
              Original message
              <textarea name="body" required rows={6} maxLength={12000} />
            </label>
            {error && (
              <p role="alert" className="warning">
                {error}
              </p>
            )}
            <button className="primary" disabled={busy}>
              {busy ? "Analyzing…" : "Add and analyze"}
            </button>
          </form>
        </Dialog>
      )}
      {records && (
        <Dialog title={records.title} close={() => setRecords(null)}>
          {records.rows.length ? (
            records.rows.map((r) => (
              <button
                className="trace"
                key={r.id}
                onClick={() => {
                  setRecords(null);
                  setSelected(r.contact_id);
                }}
              >
                <strong>{r.name}</strong>
                <span>
                  {r.id} · {date(r.at)}
                </span>
                <ChevronRight size={16} />
              </button>
            ))
          ) : (
            <p>No observed records. A missing source feed remains unknown.</p>
          )}
        </Dialog>
      )}
    </div>
  );
}
function Stat({
  label,
  value,
  note,
}: {
  label: string;
  value: number;
  note: string;
}) {
  return (
    <div className="stat">
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{note}</small>
    </div>
  );
}
function Claims({ rows }: { rows: Claim[] }) {
  return (
    <p>
      {rows.map((c, i) => (
        <React.Fragment key={i}>
          {c.text} <sup>{c.source_id}</sup>{" "}
        </React.Fragment>
      ))}
    </p>
  );
}
function LeadDetail({
  lead: l,
  busy,
  act,
  error,
}: {
  lead: Lead;
  busy: boolean;
  act: (path: string, body: unknown) => Promise<void>;
  error: string;
}) {
  const [when, setWhen] = useState(""),
    [note, setNote] = useState("");
  return (
    <>
      <div className="detail-meta">
        <Badge>{l.status}</Badge>
        <span>
          {l.company_name || "Company not recorded"} · {l.owner ?? "Unassigned"}
        </span>
        <strong>{l.score}/100</strong>
      </div>
      <p>{l.rationale}</p>
      <h3>Qualification checks</h3>
      {l.checks.map((c) => (
        <details className="check" key={c.name}>
          <summary>
            <span className={c.result}>
              {c.result === "pass" ? (
                <Check size={15} />
              ) : c.result === "fail" ? (
                "×"
              ) : (
                "?"
              )}
            </span>
            {c.name}
            <small>
              {c.points}/{c.weight} · {c.result}
            </small>
          </summary>
          {c.evidence.length ? (
            c.evidence.map((e) => <p key={e}>{e}</p>)
          ) : (
            <p>No recorded evidence.</p>
          )}
        </details>
      ))}
      <h3>Messages & extraction</h3>
      {l.messages.map((m) => (
        <details className="message" key={m.id} open={l.messages.length === 1}>
          <summary>
            {m.id} · {m.channel} · {date(m.received_at)}
          </summary>
          <blockquote>{m.body}</blockquote>
          {l.analyses
            .filter((a) => a.message_id === m.id)
            .map((a) => (
              <div className="analysis" key={a.id}>
                <Badge>{a.mode}</Badge>
                <small>Effective {date(a.effective_at)}</small>
                {a.error ? (
                  <p className="warning">{a.error}</p>
                ) : (
                  <pre>{JSON.stringify(a.signal, null, 2)}</pre>
                )}
              </div>
            ))}
        </details>
      ))}
      <button
        disabled={busy || !l.messages.length}
        onClick={() => act("/leads/" + l.id + "/reanalyze", {})}
      >
        {busy ? "Working…" : "Reanalyze with configured provider"}
      </button>
      <h3>Reply draft</h3>
      <blockquote>
        {l.reply_draft ?? "No outreach draft for this status."}
      </blockquote>
      <small>Draft only. Nothing is sent.</small>
      <h3>Record a sales decision</h3>
      <label>
        Decision time (blank = now)
        <input
          value={when}
          onChange={(e) => setWhen(e.target.value)}
          placeholder="2026-10-07T15:00:00+03:00"
        />
      </label>
      <label>
        Note
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={2}
        />
      </label>
      {error && (
        <p role="alert" className="warning">
          {error}
        </p>
      )}
      <div className="actions">
        {["accepted", "rejected"].map((d) => (
          <button
            className={d === "accepted" ? "primary" : ""}
            key={d}
            disabled={busy}
            onClick={() =>
              act("/leads/" + l.id + "/decisions", {
                decision: d,
                note,
                ...(when ? { decided_at: when } : {}),
              })
            }
          >
            {d === "accepted" ? "Accept" : "Reject"}
          </button>
        ))}
      </div>
      <h3>Decision history</h3>
      {[...l.decisions]
        .sort((a, b) => Date.parse(b.decided_at) - Date.parse(a.decided_at))
        .map((d) => (
          <p key={d.id}>
            <Badge>{d.decision}</Badge> {date(d.decided_at)} ·{" "}
            {d.note || "No note"}
          </p>
        ))}
      {!l.decisions.length && <p>No sales decisions recorded.</p>}
    </>
  );
}
createRoot(document.getElementById("root")!).render(<App />);
