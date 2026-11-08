import type { Lead } from "../../../shared/contracts";
import { Badge } from "../../components/Badge";
import { date } from "../../lib/date";
export function MessageHistory({ lead: l }: { lead: Lead }) {
  return (
    <section className="detail-section">
      {" "}
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
    </section>
  );
}
