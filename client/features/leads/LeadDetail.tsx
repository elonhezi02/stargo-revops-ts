import { useState } from "react";
import { QualificationChecks } from "./QualificationChecks";
import { MessageHistory } from "./MessageHistory";
import type { Lead } from "../../../shared/contracts";
import { Badge } from "../../components/Badge";
import { date } from "../../lib/date";
export function LeadDetail({
  lead: l,
  busy,
  onReanalyze,
  onDecide,
  error,
}: {
  lead: Lead;
  busy: boolean;
  onReanalyze: () => Promise<void>;
  onDecide: (body: unknown) => Promise<void>;
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
      <QualificationChecks lead={l} />
      <MessageHistory lead={l} />
      <button disabled={busy || !l.messages.length} onClick={onReanalyze}>
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
              onDecide({
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
