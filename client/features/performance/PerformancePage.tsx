import { ArrowUpRight } from "lucide-react";
import type { TraceSelection } from "./TraceDialog";
import type { Workspace } from "../../../shared/contracts";
export function PerformancePage({
  data,
  setRecords,
}: {
  data: Workspace;
  setRecords: (records: TraceSelection) => void;
}) {
  return (
    <>
      <div className="notice">
        Partial coverage: historical-reactivation feed was not received. Unknown
        is not zero.
      </div>
      <section className="stats">
        {data.pack.metrics.map((m) => (
          <button
            className="stat clickable"
            key={m.key}
            onClick={() => setRecords({ title: m.label, rows: m.records })}
          >
            <span>{m.label}</span>
            <strong>
              {m.actual}
              <em> / {m.target}</em>
            </strong>
            <div className="progress">
              <i
                style={{
                  width: Math.min(100, (100 * m.actual) / m.target) + "%",
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
              onClick={() => setRecords({ title: s.source, rows: s.records })}
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
                {m.key === "ql" ? "Accepted expansion contacts" : m.label}
              </span>
              <strong>{m.actual}</strong>
            </button>
          ))}
          <p className="panel-note">
            Meeting and opportunity dates determine the reporting week,
            including earlier cohorts. A current sales decision does not rewrite
            this historical week.
          </p>
        </section>
      </div>
    </>
  );
}
