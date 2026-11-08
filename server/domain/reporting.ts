import { DateTime } from "luxon";
import {
  Sources,
  type State,
  type Pack,
  type Metric,
  type Trace,
} from "../../shared/contracts.js";
import {
  instant,
  segment,
  qualify,
  decisionAt,
  parts,
} from "./qualification.js";
const START = DateTime.fromISO("2026-10-04", { zone: "Asia/Jerusalem" })
  .startOf("day")
  .toMillis();
const END = DateTime.fromISO("2026-10-09", { zone: "Asia/Jerusalem" })
  .startOf("day")
  .toMillis();
export const inWeek = (v: string) => instant(v) >= START && instant(v) < END;
const definitions = [
  ["ql", "Qualified leads", 25],
  ["meeting_booked", "Meetings booked", 15],
  ["meeting_held", "Meetings held", 12],
  ["opportunity_created", "Opportunities", 5],
] as const;
export function report(s: State): Pack {
  const make = (): Metric[] =>
    definitions.map(([key, label, target]) => ({
      key,
      label,
      target,
      actual: 0,
      records: [],
    }));
  const metrics = make(),
    expansion = make().map((m) => ({
      ...m,
      target: 0,
      label: m.key === "ql" ? "Accepted expansion contacts" : m.label,
    }));
  const sources = [...Sources, "source not recorded"].map((source) => ({
    source,
    actual: s.feeds[source] === "not_received" ? null : (0 as number | null),
    observed: 0,
    records: [] as Trace[],
  }));
  for (const c of s.contacts) {
    const d = decisionAt(s, c.id, END - 1);
    if (!d || d.decision !== "accepted" || !inWeek(d.decided_at)) continue;
    const bucket = segment(s, c, instant(d.decided_at));
    const q = qualify(s, c, instant(d.decided_at));
    const trace = {
      id: d.id,
      contact_id: c.id,
      name: `${c.first_name} ${c.last_name}`.trim(),
      at: d.decided_at,
    };
    if (bucket === "expansion") {
      expansion[0].records.push(trace);
      continue;
    }
    if (bucket !== "acquisition" || q.status !== "QL") continue;
    const first = parts(s, c.id).messages[0];
    const source = first?.source ?? "source not recorded";
    metrics[0].records.push({ ...trace, source });
    const row = sources.find((x) => x.source === source)!;
    row.records.push({ ...trace, source });
    row.observed++;
    if (row.actual !== null) row.actual++;
  }
  for (const e of s.events) {
    if (!inWeek(e.occurred_at)) continue;
    const c = s.contacts.find((c) => c.id === e.contact_id);
    if (!c) continue;
    const bucket = segment(s, c, instant(e.occurred_at));
    if (bucket === "existing-deal") continue;
    const list = bucket === "expansion" ? expansion : metrics;
    list
      .find((m) => m.key === e.type)!
      .records.push({
        id: e.id,
        contact_id: c.id,
        name: `${c.first_name} ${c.last_name}`.trim(),
        at: e.occurred_at,
      });
  }
  [...metrics, ...expansion].forEach((m) => (m.actual = m.records.length));
  return {
    start: new Date(START).toISOString(),
    end_exclusive: new Date(END).toISOString(),
    timezone: "Asia/Jerusalem",
    partial: Object.values(s.feeds).includes("not_received"),
    metrics,
    sources,
    expansion,
  };
}
export function markdown(p: Pack, gap: { question: string; score: number }) {
  const table = p.metrics
    .map(
      (m) =>
        `| ${m.label} | ${m.actual} | ${m.target} | ${m.records.map((r) => r.id).join(", ") || "—"} |`,
    )
    .join("\n");
  const [q, b, h, o] = p.metrics;
  return `# Weekly KPI pack\n\n4–8 October 2026 · Asia/Jerusalem. Observed results; missing historical-reactivation feed means totals are partial.\n\n| Metric | Observed | Target | Record IDs |\n|---|---:|---:|---|\n${table}\n\n## First-touch source\n\n${p.sources.map((s) => `- ${s.source}: ${s.actual === null ? "unknown (feed not received)" : s.actual}; observed IDs: ${s.records.map((r) => r.id).join(", ") || "none"}`).join("\n")}\n\n## Expansion (separate)\n\n${p.expansion.map((m) => `- ${m.label}: ${m.actual} (${m.records.map((r) => r.id).join(", ") || "no observed events"})`).join("\n")}\n\n## Note to the CRO\n\nObserved acquisition delivered ${q.actual}/${q.target} qualified leads, ${b.actual}/${b.target} meetings booked, ${h.actual}/${h.target} held and ${o.actual}/${o.target} opportunities. Every measure is below target; the missing reactivation feed prevents a complete total. Expansion is reported separately. The top visibility gap is “${gap.question}” (${gap.score}/100): buyers considering alternatives may not find Stargo or owned evidence. Next week, publish a reviewed, source-grounded answer to that question and measure qualified inbound from it. Do not relabel enquiries to close the target gap.\n`;
}
