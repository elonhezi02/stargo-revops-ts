import { Sparkles } from "lucide-react";
import { Claims } from "./Claims";
import type { Workspace } from "../../../shared/contracts";
import { Badge } from "../../components/Badge";
export function VisibilityPage({
  data,
  busy,
  onGenerate,
}: {
  data: Workspace;
  busy: boolean;
  onGenerate: () => void;
}) {
  return (
    <>
      <div className="notice">
        Score = priority / 3 × (40% missing mention + 30% missing owned citation
        + 20% flagged claims + 10% competitor presence). Each rate is measured
        across the three engines.
      </div>
      <section className="panel">
        <div className="toolbar">
          <h2>Ranked visibility gaps</h2>
        </div>
        {data.gaps.map((g, i) => (
          <details className="gap" key={g.id}>
            <summary>
              <span className="rank">{String(i + 1).padStart(2, "0")}</span>
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
                    <a key={u} href={u} target="_blank" rel="noreferrer">
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
          <button className="primary" disabled={busy} onClick={onGenerate}>
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
              Proof points are illustrative and approved only for this exercise.
              Every emitted factual sentence comes from the approved claim
              catalog.
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
  );
}
