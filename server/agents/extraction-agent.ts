import { z } from "zod";
import {
  SignalSchema,
  type Signal,
  type Contact,
} from "../../shared/contracts.js";
import { unavailableModel, type Generator } from "../ports/model.js";
import { extractionPrompt } from "./prompts/extraction.js";
const injection =
  /ignore.{0,60}(rules|instructions|previous)|system\s*(note|prompt|message)|\b(developer|assistant)\s*:|mark.{0,40}(qualified|score)|reveal.{0,30}prompt|התעלם.{0,30}(הוראות|כללים)/is;
const fact = (text: string, pattern: RegExp, value?: string) => {
  const match = text.match(pattern);
  return match ? { value: value ?? match[0], evidence: match[0] } : null;
};
export function rules(body: string): Signal {
  if (/[\u0400-\u052f\u0600-\u06ff\u4e00-\u9fff]/u.test(body))
    throw new Error("Unsupported language");
  let intent: Signal["intent"] = "other",
    intent_evidence: string | null = null;
  const patterns: [Signal["intent"], RegExp][] = [
    [
      "unsubscribe",
      /unsubscribe|remove me.{0,40}(list|mail)|stop (emailing|contacting)|הסר.{0,20}(דיוור|רשימ)/i,
    ],
    ["auto-reply", /out of (the )?office|automatic reply|auto.?reply/i],
    [
      "not interested",
      /not interested|no interest|geen interesse|לא מעוניי|(?:do not|don.t|not) want.{0,25}(demo|call|pilot)/i,
    ],
    ["job seeker", /internship|\bintern\b|\bstudent\b|looking for a job/i],
    ["investor", /funding round|investment|investor/i],
    ["partnership", /partnership|white.label/i],
    ["pilot", /\bpilot\b|\bpoc\b/i],
    ["pricing", /pricing|what would.{0,60}cost|how much/i],
    [
      "demo",
      /\bdemo\b|can we (talk|see|schedule|book)|can you show|open to.{0,30}call|happy to chat|looking forward to.{0,20}call|אשמח לשיחה/i,
    ],
  ];
  for (const [name, re] of patterns) {
    const m = body.match(re);
    if (m) {
      intent = name;
      intent_evidence = m[0];
      break;
    }
  }
  let role = fact(
    body,
    /\b(i own|i run|owner|founder|co-founder|COO|CEO|CFO|(?:head|director|manager|vp|vice president) (?:of )?[\w -]{0,40})\b/i,
  );
  if (role && /^i own$/i.test(role.value)) role.value = "owner";
  if (role && /^i run$/i.test(role.value)) role.value = "operations manager";
  const size = body.match(/(\d[\d,]*)[- ](?:person|employee|staff|people)/i);
  let region: Signal["company_region"] = null;
  for (const [pattern, value] of [
    [/\b(Haifa|Israel|Tel Aviv)\b|ישראל|חיפה/i, "Israel"],
    [/\bSingapore\b/i, "Singapore"],
    [/\b(United States|USA)\b/i, "United States"],
    [/\bUS\b/, "United States"],
    [/\b(UK|United Kingdom|London)\b/i, "UK"],
    [/\b(Germany|DACH)\b/i, "DACH"],
    [/\b(Netherlands|Belgium|Benelux)\b/i, "Benelux"],
    [/\b(Sweden|Norway|Denmark|Finland|Nordics)\b/i, "Nordics"],
  ] as const) {
    region = fact(body, pattern, value);
    if (region) break;
  }
  return SignalSchema.parse({
    language: /[\u0590-\u05ff]/u.test(body)
      ? "he"
      : /bedankt|geen interesse/i.test(body)
        ? "nl"
        : "en",
    intent,
    interest: ["demo", "pricing", "pilot"].includes(intent),
    intent_evidence,
    buyer_role: role,
    data_problem: fact(
      body,
      /rate (?:requests|quoting|cards)|spot.{0,15}(?:rate|quot)|quoting automation|benchmarking carrier quotes|document (?:extraction|automation)|re.?keys.{0,100}(?:invoices|documents|TMS)|manual booking entry|reconciling carrier invoices.{0,45}rates|bills of lading|air waybills?|import declarations.{0,90}manually|בקשות להצעות מחיר.{0,90}ידנית/i,
    ),
    company_name: null,
    company_vertical: fact(
      body,
      /customs broker(?:age)?|freight forward(?:er|ing)|\b3pl\b|trucking|air cargo|ground handl(?:er|ing)|trade.finance|\bcarrier\b|\bshipper\b/i,
    ),
    company_employees: size
      ? { value: Number(size[1].replaceAll(",", "")), evidence: size[0] }
      : null,
    company_region: region,
    unsafe: false,
  });
}
export async function extract(
  body: string,
  contact: Contact | undefined,
  provider = "rules",
  call: Generator = unavailableModel,
  prompt: string = extractionPrompt.system,
) {
  try {
    if (injection.test(body)) throw new Error("Instructions detected");
    const literal = rules(body);
    const signal =
      provider === "rules"
        ? literal
        : SignalSchema.parse(
            await call(
              prompt,
              {
                message: body,
                crm: contact ?? null,
                literal_candidates: literal,
              },
              z.toJSONSchema(SignalSchema),
            ),
          );
    for (const key of [
      "buyer_role",
      "data_problem",
      "company_name",
      "company_vertical",
      "company_employees",
      "company_region",
    ] as const) {
      const item = signal[key];
      if (item && !body.includes(item.evidence))
        throw new Error("Invalid evidence");
    }
    if (
      signal.unsafe ||
      (signal.intent_evidence && !body.includes(signal.intent_evidence)) ||
      (signal.interest && !signal.intent_evidence)
    )
      throw new Error("Unsafe or unsupported");
    if (
      signal.company_employees &&
      !Array.from(
        signal.company_employees.evidence.matchAll(/\b\d[\d,]*\b/g),
        (m) => Number(m[0].replaceAll(",", "")),
      ).includes(signal.company_employees.value)
    )
      throw new Error("Invented count");
    if (provider !== "rules") {
      for (const key of [
        "buyer_role",
        "data_problem",
        "company_vertical",
        "company_region",
      ] as const) {
        if (signal[key]) {
          if (!literal[key]) throw new Error("Unverified fact");
          signal[key] = literal[key];
        }
      }
      if (
        signal.company_name &&
        !signal.company_name.evidence
          .toLowerCase()
          .includes(signal.company_name.value.toLowerCase())
      )
        throw new Error("Unverified company");
      if (signal.interest && !literal.interest)
        throw new Error("Unsupported interest");
      if (
        [
          "unsubscribe",
          "not interested",
          "auto-reply",
          "partnership",
          "investor",
          "job seeker",
        ].includes(literal.intent)
      ) {
        signal.intent = literal.intent;
        signal.interest = false;
        signal.intent_evidence = literal.intent_evidence;
      }
    }
    return { mode: provider, signal, error: null };
  } catch {
    return {
      mode: provider,
      signal: null,
      error:
        "Analysis failed or requires human verification. No automatic qualification.",
    };
  }
}
