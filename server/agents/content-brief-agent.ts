import { z } from "zod";
import { unavailableModel, type Generator } from "../ports/model.js";
import { briefPrompt } from "./prompts/content-brief.js";
import type { Brief, Gap } from "../../shared/contracts.js";
export const claims = {
  position: {
    source_id: "BC-1",
    text: "Stargo builds agentic AI that turns messy enterprise documents, emails and datasets into trusted operational transactions across freight, logistics and trade finance.",
  },
  control: { source_id: "BC-1", text: "Agents draft, and people approve." },
  quote: {
    source_id: "BC-3a",
    text: "The Rate Quoting Agent reads emailed rate requests, pulls relevant tariffs and contracts, and drafts a quote for a pricing analyst to approve.",
  },
  documents: {
    source_id: "BC-3b",
    text: "Document Extraction extracts structured fields from bills of lading, air waybills, invoices and customs paperwork into the TMS or ERP, with validation.",
  },
  reconcile: {
    source_id: "BC-3c",
    text: "Invoice and Contract Reconciliation matches carrier invoices to contracted rates and flags discrepancies for review.",
  },
  trade: {
    source_id: "BC-3d",
    text: "Trade Document Checking validates trade documents for finance teams before funds move.",
  },
  pilot: {
    source_id: "PP-1",
    text: "A European forwarder pilot cut median spot-quote turnaround from about 3 hours to under 15 minutes.",
  },
  accuracy: {
    source_id: "PP-2",
    text: "Document extraction pilots reached 97% field-level accuracy on bills of lading after human review.",
  },
  identity: {
    source_id: "BC-5",
    text: "Stargo is not a carrier, broker, forwarder or travel company. It does not move freight.",
  },
} as const;
const ClaimId = z.enum([
  "position",
  "control",
  "quote",
  "documents",
  "reconcile",
  "trade",
  "pilot",
  "accuracy",
  "identity",
]);
const planObject = z
  .object({
    direct_answer: z
      .array(ClaimId)
      .length(3)
      .describe("Exactly position, quote, control, a 50-word direct answer."),
    sections: z
      .array(
        z
          .object({
            heading: z.enum([
              "What Stargo does",
              "Quoting workflow",
              "Document workflows",
              "Human approval",
              "Illustrative pilot evidence",
            ]),
            claims: z.array(ClaimId).min(1).max(3),
          })
          .strict(),
      )
      .min(3)
      .max(5),
    faq: z
      .array(
        z
          .object({
            question: z.enum([
              "What does Stargo do?",
              "Who approves a quote?",
              "What pilot evidence is available?",
              "Does Stargo move freight?",
            ]),
            claims: z.array(ClaimId).min(1).max(2),
          })
          .strict(),
      )
      .min(3)
      .max(4),
    schema_type: z.literal("Article"),
  })
  .strict();
export const Plan = planObject.superRefine((p, ctx) => {
  const count = p.direct_answer
    .map((id) => claims[id].text)
    .join(" ")
    .split(/\s+/).length;
  if (count < 40 || count > 60)
    ctx.addIssue({ code: "custom", message: "Answer must have 40–60 words" });
  if (
    new Set(p.sections.map((x) => x.heading)).size !== p.sections.length ||
    new Set(p.faq.map((x) => x.question)).size !== p.faq.length
  )
    ctx.addIssue({ code: "custom", message: "Repeated section or FAQ" });
});
export async function contentBrief(
  gap: Gap,
  provider = "rules",
  call: Generator = unavailableModel,
  prompt: string = briefPrompt.system,
): Promise<Brief> {
  try {
    const offline = {
      direct_answer: ["position", "quote", "control"],
      sections: [
        { heading: "Quoting workflow", claims: ["quote"] },
        { heading: "Human approval", claims: ["control"] },
        { heading: "Illustrative pilot evidence", claims: ["pilot"] },
      ],
      faq: [
        { question: "What does Stargo do?", claims: ["position"] },
        { question: "Who approves a quote?", claims: ["quote", "control"] },
        { question: "What pilot evidence is available?", claims: ["pilot"] },
      ],
      schema_type: "Article",
    };
    const plan = Plan.parse(
      provider === "rules"
        ? offline
        : await call(
            prompt,
            { question: gap.question, approved_claims: claims },
            z.toJSONSchema(planObject),
          ),
    );
    return {
      status: "ready",
      mode:
        provider === "rules"
          ? "Offline template"
          : "LLM-selected constrained claims",
      title: gap.question,
      direct_answer: plan.direct_answer.map((id) => claims[id]),
      word_count: plan.direct_answer
        .map((id) => claims[id].text)
        .join(" ")
        .split(/\s+/).length,
      sections: plan.sections.map((s) => ({
        heading: s.heading,
        claims: s.claims.map((id) => claims[id]),
      })),
      faq: plan.faq.map((q) => ({
        question: q.question,
        claims: q.claims.map((id) => claims[id]),
      })),
      schema_type: plan.schema_type,
    };
  } catch {
    return {
      status: "needs review",
      mode: provider,
      error: "Content blocked: model failure or unsupported content contract.",
    };
  }
}
