import { Check } from "lucide-react";
import type { Lead } from "../../../shared/contracts";
export function QualificationChecks({ lead: l }: { lead: Lead }) {
  return (
    <section className="detail-section">
      {" "}
      <h3>Automated qualification checks</h3>
      <p className="muted">These four checks determine the priority score.</p>
      {l.checks
        .filter((c) => c.name !== "Sales acceptance")
        .map((c) => (
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
      <h3>Human sales decision</h3>
      <p className="muted">
        Recorded by a reviewer, not by the agent. Required for QL status
        alongside the four checks above; it does not add points or override
        them.
      </p>
      {l.checks
        .filter((c) => c.name === "Sales acceptance")
        .map((c) => (
          <details className="check" key={c.name}>
            <summary>
              <span className={c.result}>
                {c.result === "pass" ? (
                  <Check size={15} />
                ) : c.result === "fail" ? (
                  "×"
                ) : (
                  "…"
                )}
              </span>
              {c.result === "pass"
                ? "Approved by sales"
                : c.result === "fail"
                  ? "Rejected by sales"
                  : "Awaiting sales approval"}
            </summary>
            {c.evidence.length ? (
              c.evidence.map((e) => <p key={e}>{e}</p>)
            ) : (
              <p>
                No human decision recorded. Use the sales decision form below.
              </p>
            )}
          </details>
        ))}
    </section>
  );
}
