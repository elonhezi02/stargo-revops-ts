import { useState } from "react";
import { Search, ArrowUpRight } from "lucide-react";
import { Stat } from "../../components/Stat";
import { date } from "../../lib/date";
import type { Workspace } from "../../../shared/contracts";
import { Badge } from "../../components/Badge";
export function LeadQueue({
  data,
  onSelect,
}: {
  data: Workspace;
  onSelect: (id: string) => void;
}) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const leads = data.leads.filter(
    (l) =>
      (status === "All" || l.status === status) &&
      `${l.name} ${l.company_name} ${l.email}`
        .toLowerCase()
        .includes(search.toLowerCase()),
  );

  return (
    <>
      <section className="stats">
        <Stat
          label="Current qualified"
          value={data.leads.filter((l) => l.status === "QL").length}
          note="All five checks passed"
        />
        <Stat
          label="Ready for sales review"
          value={data.leads.filter((l) => l.status === "QL candidate").length}
          note="Acceptance still required"
        />
        <Stat
          label="Needs human review"
          value={data.leads.filter((l) => l.status === "needs review").length}
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
                    <button className="person" onClick={() => onSelect(l.id)}>
                      {l.name}
                    </button>
                    <small>{l.company_name || "Company not recorded"}</small>
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
                    <span className={"score " + (l.score >= 70 ? "high" : "")}>
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
                      onClick={() => onSelect(l.id)}
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
        <summary>Data hygiene · {data.rejected.length} rejected record</summary>
        {data.rejected.map((r) => (
          <p key={r.id}>
            {r.id}: {r.reason}
          </p>
        ))}
      </details>
    </>
  );
}
