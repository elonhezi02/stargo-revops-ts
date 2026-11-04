import {
  QualificationSchema,
  type Contact,
  type State,
  type Signal,
  type Qualification,
} from "../shared/contracts.js";
export const instant = (v: string) =>
  Date.parse(v.length === 10 ? v + "T00:00:00Z" : v);
const regions: Record<string, string> = {
  nl: "Benelux",
  netherlands: "Benelux",
  be: "Benelux",
  belgium: "Benelux",
  benelux: "Benelux",
  se: "Nordics",
  sweden: "Nordics",
  no: "Nordics",
  norway: "Nordics",
  dk: "Nordics",
  denmark: "Nordics",
  fi: "Nordics",
  finland: "Nordics",
  nordics: "Nordics",
  uk: "UK",
  "united kingdom": "UK",
  de: "DACH",
  germany: "DACH",
  dach: "DACH",
  at: "DACH",
  austria: "DACH",
  ch: "DACH",
  switzerland: "DACH",
  sg: "Singapore",
  singapore: "Singapore",
  us: "United States",
  usa: "United States",
  "united states": "United States",
  il: "Israel",
  israel: "Israel",
};
const owners: Record<string, string> = {
  Benelux: "Dana",
  Nordics: "Dana",
  UK: "Leo",
  DACH: "Leo",
  Singapore: "Mei",
  "United States": "Sam",
  Israel: "Noa",
  APAC: "Mei",
};
export function parts(s: State, id: string) {
  return {
    messages: s.messages
      .filter((m) => m.contact_id === id)
      .sort((a, b) => instant(a.received_at) - instant(b.received_at)),
    analyses: s.analyses.filter((a) => a.contact_id === id),
    decisions: s.decisions.filter((d) => d.contact_id === id),
  };
}
export function decisionAt(s: State, id: string, at: number) {
  return s.decisions
    .filter((d) => d.contact_id === id && instant(d.decided_at) <= at)
    .sort(
      (a, b) =>
        instant(b.decided_at) - instant(a.decided_at) ||
        b.sequence - a.sequence,
    )[0];
}
export function segment(
  s: State,
  c: Contact,
  at = Date.now(),
): Qualification["segment"] {
  if (c.is_customer) return "expansion";
  const { messages, decisions } = parts(s, c.id);
  const first = messages.find((m) => instant(m.received_at) <= at);
  const accepts = decisions
    .filter((d) => d.decision === "accepted" && instant(d.decided_at) <= at)
    .map((d) => instant(d.decided_at));
  const initial = first ? instant(first.received_at) : Math.min(...accepts);
  const deal =
    c.open_deal_id && c.open_deal_created
      ? instant(c.open_deal_created)
      : Infinity;
  return deal <= at && deal < initial && deal < Math.min(...accepts)
    ? "existing-deal"
    : "acquisition";
}
export function qualify(s: State, c: Contact, at = Date.now()): Qualification {
  const { analyses } = parts(s, c.id);
  const latest = new Map<string, State["analyses"][number]>();
  for (const a of analyses) {
    if (instant(a.received_at) > at || instant(a.effective_at) > at) continue;
    const prior = latest.get(a.message_id);
    if (!prior || instant(a.effective_at) >= instant(prior.effective_at))
      latest.set(a.message_id, a);
  }
  const rows = [...latest.values()].sort(
    (a, b) => instant(a.received_at) - instant(b.received_at),
  );
  const signals = rows
    .filter((a) => a.signal)
    .map((a) => ({ s: a.signal!, id: a.message_id }));
  const last = signals.at(-1)?.s;
  const get = (
    crm: keyof Contact,
    key: keyof Signal,
  ): { value: string | null; evidence: string[] } => {
    const v = c[crm];
    if (v !== null && v !== undefined && v !== "")
      return { value: String(v), evidence: [`CRM ${c.id}: ${v}`] };
    for (const row of [...signals].reverse()) {
      const f = row.s[key];
      if (f && typeof f === "object" && "value" in f)
        return {
          value: String(f.value),
          evidence: [`${row.id} · stated, unverified: “${f.evidence}”`],
        };
    }
    return { value: null, evidence: [] };
  };
  const country = get("country", "company_region"),
    vertical = get("vertical", "company_vertical"),
    size = get("employees", "company_employees"),
    role = get("job_title", "buyer_role");
  const region = regions[country.value?.toLowerCase() ?? ""];
  const employees = size.value === null ? null : Number(size.value);
  const goodVertical =
    !!vertical.value &&
    /freight.forward|carrier|3pl|truck|air.cargo|ground.handl|customs.broker|shipper|trade.finance/i.test(
      vertical.value,
    );
  const fit =
    !vertical.value || !country.value || employees === null
      ? "unknown"
      : goodVertical && region && employees >= 20
        ? "pass"
        : "fail";
  const explicitBad =
    (vertical.value && !goodVertical) ||
    (country.value && !region) ||
    (employees !== null && employees < 20);
  const buyer = !role.value
    ? "unknown"
    : /owner|founder/i.test(role.value)
      ? employees === null
        ? "unknown"
        : employees < 200
          ? "pass"
          : "fail"
      : /manager|director|head|vp|vice president|COO|CEO|CFO/i.test(
            role.value,
          ) &&
          /pricing|operation|procurement|commercial|finance|digital|transportation|supply.chain|logistics|customs|COO|CEO|CFO|managing director|station/i.test(
            role.value,
          )
        ? "pass"
        : "fail";
  const problem = signals.filter((x) => x.s.data_problem);
  const interested = signals.filter((x) => x.s.interest);
  const negative =
    last &&
    [
      "not interested",
      "unsubscribe",
      "auto-reply",
      "partnership",
      "investor",
      "job seeker",
    ].includes(last.intent);
  const decision = decisionAt(s, c.id, at);
  const bucket = segment(s, c, at);
  const checks: Qualification["checks"] = [
    {
      name: "Company fit",
      result: explicitBad ? "fail" : fit,
      evidence: [...country.evidence, ...vertical.evidence, ...size.evidence],
      weight: 30,
      points: 0,
    },
    {
      name: "Relevant buyer",
      result: buyer,
      evidence: role.evidence,
      weight: 20,
      points: 0,
    },
    {
      name: "Specific data problem",
      result: problem.length ? "pass" : "unknown",
      evidence: problem.map((x) => `${x.id}: “${x.s.data_problem!.evidence}”`),
      weight: 30,
      points: 0,
    },
    {
      name: "Expressed interest",
      result: negative ? "fail" : interested.length ? "pass" : "unknown",
      evidence: negative
        ? [last!.intent_evidence ?? last!.intent]
        : interested.map((x) => `${x.id}: “${x.s.intent_evidence}”`),
      weight: 20,
      points: 0,
    },
    {
      name: "Sales acceptance",
      result:
        decision?.decision === "accepted"
          ? "pass"
          : decision
            ? "fail"
            : "unknown",
      evidence: decision
        ? [`${decision.id}: ${decision.decision} at ${decision.decided_at}`]
        : [],
      weight: 0,
      points: 0,
    },
  ];
  checks.forEach((x) => {
    x.points = x.result === "pass" ? x.weight : 0;
  });
  let status: Qualification["status"] = "nurture",
    rationale = "Some qualification evidence is missing or interest is absent.";
  if (signals.some((x) => x.s.intent === "unsubscribe")) {
    status = "suppressed";
    rationale = "Unsubscribe request: no outreach draft.";
  } else if (rows.some((a) => a.error)) {
    status = "needs review";
    rationale = "Failed analysis or unsafe instructions require human review.";
  } else if (bucket !== "acquisition") {
    status = "excluded";
    rationale =
      bucket === "expansion"
        ? "Existing customer; report expansion separately."
        : "Deal predates inbound and acceptance.";
  } else if (
    /competitor|vendor|investor/i.test(c.vertical + " " + c.lead_status) ||
    (last &&
      ["auto-reply", "partnership", "investor", "job seeker"].includes(
        last.intent,
      ))
  ) {
    status = "excluded";
    rationale = "Non-acquisition intent or excluded organization.";
  } else if (!rows.length) {
    status = "excluded";
    rationale = "No inbound evidence; imported status is not qualification.";
  } else if (decision?.decision === "rejected") {
    status = "disqualified";
    rationale = "Sales rejected: " + (decision.note || "recorded decision");
  } else if (checks.every((x) => x.result === "pass")) {
    status = "QL";
    rationale = "All five checks pass, including recorded sales acceptance.";
  } else if (checks.slice(0, 4).every((x) => x.result === "pass")) {
    status = "QL candidate";
    rationale = "Four checks pass; awaiting recorded sales acceptance.";
  } else if (checks.slice(0, 2).some((x) => x.result === "fail")) {
    status = "disqualified";
    rationale = "Company or buyer does not meet the QL standard.";
  }
  let owner: string | null = owners[region ?? ""] ?? "Triage queue";
  if (c.is_customer || c.open_deal_id) owner = c.owner || owner;
  if (last?.intent === "investor") owner = "Founders";
  if (status === "disqualified") owner = null;
  return QualificationSchema.parse({
    status,
    score: checks.reduce((n, x) => n + x.points, 0),
    owner,
    segment: bucket,
    checks,
    rationale,
    reply_draft: ["QL", "QL candidate"].includes(status)
      ? `Thanks for sharing your workflow, ${c.first_name}. Would a short call with our team help us explore the problem you described? Draft for human approval.`
      : null,
  });
}
