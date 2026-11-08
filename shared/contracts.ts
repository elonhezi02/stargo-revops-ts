import { z } from "zod";
export const Sources = [
  "event-email",
  "paid",
  "historical-reactivation",
  "new-connection",
  "warm-network",
  "organic/referral",
] as const;
const Timestamp = z.string().datetime({ offset: true });
const NullableText = z.string().nullable();
export const InboundSchema = z
  .object({
    id: z.string().optional(),
    from_name: z.string().trim().min(1).max(200),
    from_email: z
      .preprocess(
        (v) => (typeof v === "string" && !v.trim() ? null : v),
        z.string().trim().email().nullable().optional(),
      )
      .transform((v) => v?.toLowerCase() ?? null),
    linkedin_url: NullableText.optional(),
    channel: z.enum(["email_reply", "form_fill", "linkedin_dm"]),
    body: z.string().trim().min(1).max(12000),
    subject: NullableText.optional(),
    source: z.preprocess(
      (v) => (v === "" ? null : v),
      z.enum(Sources).nullable().optional(),
    ),
    received_at: Timestamp.default(() => new Date().toISOString()),
  })
  .strict();
export type Inbound = z.infer<typeof InboundSchema>;
const Fact = z
  .object({ value: z.string().min(1), evidence: z.string().min(1).max(1500) })
  .strict();
const EmployeeFact = z
  .object({
    value: z.number().int().nonnegative(),
    evidence: z.string().min(1).max(1500),
  })
  .strict();
export const SignalSchema = z
  .object({
    language: z.string().min(2),
    intent: z.enum([
      "demo",
      "pricing",
      "pilot",
      "not interested",
      "unsubscribe",
      "auto-reply",
      "partnership",
      "investor",
      "job seeker",
      "other",
    ]),
    interest: z.boolean(),
    intent_evidence: NullableText,
    buyer_role: Fact.nullable(),
    data_problem: Fact.nullable(),
    company_name: Fact.nullable(),
    company_vertical: Fact.nullable(),
    company_employees: EmployeeFact.nullable(),
    company_region: Fact.nullable(),
    unsafe: z.boolean(),
  })
  .strict();
export type Signal = z.infer<typeof SignalSchema>;
export const DecisionSchema = z
  .object({
    decision: z.enum(["accepted", "rejected"]),
    decided_at: Timestamp.default(() => new Date().toISOString()).refine(
      (v) => Date.parse(v) <= Date.now(),
      "Decision cannot be in the future",
    ),
    note: z.string().max(2000).default(""),
    decided_by: z.string().max(100).default("Local reviewer"),
  })
  .strict();
export type Decision = z.infer<typeof DecisionSchema> & {
  id: string;
  contact_id: string;
  sequence: number;
  recorded_at: string;
};
export type Contact = {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  linkedin_url: string | null;
  company_name: string;
  company_domain: string | null;
  country: string;
  vertical: string;
  employees: number | null;
  job_title: string;
  is_customer: boolean;
  open_deal_id: string;
  open_deal_created: string;
  owner: string;
  lead_status: string;
};
export type Message = Inbound & { id: string; contact_id: string };
export type Analysis = {
  id: string;
  contact_id: string;
  message_id: string;
  received_at: string;
  effective_at: string;
  mode: string;
  signal: Signal | null;
  error: string | null;
};
const CheckSchema = z.object({
  name: z.string(),
  result: z.enum(["pass", "fail", "unknown"]),
  evidence: z.array(z.string()),
  points: z.number(),
  weight: z.number(),
});
export const QualificationSchema = z.object({
  status: z.enum([
    "QL",
    "QL candidate",
    "excluded",
    "disqualified",
    "nurture",
    "suppressed",
    "needs review",
  ]),
  score: z.number().min(0).max(100),
  owner: z.string().nullable(),
  segment: z.enum(["acquisition", "expansion", "existing-deal"]),
  checks: z.array(CheckSchema).length(5),
  rationale: z.string(),
  reply_draft: NullableText,
});
export type Qualification = z.infer<typeof QualificationSchema>;
export type PipelineEvent = {
  id: string;
  contact_id: string;
  type: "meeting_booked" | "meeting_held" | "opportunity_created";
  occurred_at: string;
};
export type Trace = {
  id: string;
  contact_id: string;
  name: string;
  at: string;
  source?: string;
};
export type Metric = {
  key: string;
  label: string;
  actual: number;
  target: number;
  records: Trace[];
};
export type Pack = {
  start: string;
  end_exclusive: string;
  timezone: string;
  partial: boolean;
  metrics: Metric[];
  sources: {
    source: string;
    actual: number | null;
    observed: number;
    records: Trace[];
  }[];
  expansion: Metric[];
};
export type Claim = { text: string; source_id: string };
export type Brief = {
  status: "ready" | "needs review";
  mode: string;
  error?: string;
  title?: string;
  direct_answer?: Claim[];
  sections?: { heading: string; claims: Claim[] }[];
  faq?: { question: string; claims: Claim[] }[];
  schema_type?: string;
  word_count?: number;
};
export type Capture = {
  answer_id: string;
  prompt_id: string;
  prompt: string;
  priority: number;
  cluster: string;
  engine: string;
  answer_text: string;
  citations: string[];
  mentioned: boolean;
  owned_citation: boolean;
  competitors: string[];
  warnings: string[];
};
export type Gap = {
  id: string;
  question: string;
  priority: number;
  score: number;
  answers: Capture[];
};
export type State = {
  version: 1;
  revision: number;
  contacts: Contact[];
  messages: Message[];
  analyses: Analysis[];
  decisions: Decision[];
  events: PipelineEvent[];
  feeds: Record<string, string>;
  rejected: { id: string; reason: string }[];
  brief: Brief | null;
  pack: Pack | null;
};
export type Lead = Omit<Contact, "owner"> &
  Qualification & {
    name: string;
    messages: Message[];
    analyses: Analysis[];
    decisions: Decision[];
  };
export type Workspace = {
  revision: number;
  provider: string;
  model: string;
  leads: Lead[];
  pack: Pack;
  gaps: Gap[];
  brief: Brief | null;
  rejected: State["rejected"];
};
