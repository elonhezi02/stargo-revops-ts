import { readFileSync } from "node:fs";
import { join } from "node:path";
import { parse } from "csv-parse/sync";
import { DATA } from "../../config/environment.js";
import type { Contact, State } from "../../../shared/contracts.js";
import {
  emailKey,
  linkedinKey,
  domainKey,
  match,
} from "../../domain/identity.js";
import { ingest } from "../../services/ingestion-service.js";
import { report } from "../../domain/reporting.js";
import { visibility } from "./visibility.js";
import { contentBrief } from "../../agents/content-brief-agent.js";
export async function seed(): Promise<State> {
  const rows = parse(readFileSync(join(DATA, "crm_export.csv")), {
    columns: true,
    skip_empty_lines: true,
  }) as Record<string, string>[];
  const contacts: Contact[] = rows.map((r) => ({
    id: r.record_id,
    first_name: r.first_name,
    last_name: r.last_name,
    email: emailKey(r.email),
    linkedin_url: linkedinKey(r.linkedin_url),
    company_name: r.company_name,
    company_domain: domainKey(r.company_domain),
    country: r.country,
    vertical: r.vertical,
    employees: r.employees ? Number(r.employees) : null,
    job_title: r.job_title,
    is_customer: r.is_customer === "true",
    open_deal_id: r.open_deal_id,
    open_deal_created: r.open_deal_created,
    owner: r.owner,
    lead_status: r.lead_status,
  }));
  const data = JSON.parse(
    readFileSync(join(DATA, "gtm_events.json"), "utf8"),
  ) as {
    feed_status: Record<string, string>;
    inbound: Record<string, unknown>[];
    sales_decisions: {
      id: string;
      contact_email: string;
      decision: "accepted" | "rejected";
      decided_by: string;
      decided_at: string;
      note: string;
    }[];
    pipeline_events: {
      id: string;
      contact_email: string;
      type: State["events"][number]["type"];
      occurred_at: string;
    }[];
  };
  const s: State = {
    version: 1,
    revision: 0,
    contacts,
    messages: [],
    analyses: [],
    decisions: [],
    events: [],
    feeds: data.feed_status,
    rejected: [],
    brief: null,
    pack: null,
  };
  for (const input of data.inbound) {
    try {
      await ingest(s, input);
    } catch {
      s.rejected.push({
        id: String(input.id),
        reason: "Invalid inbound record or conflicting identifiers",
      });
    }
  }
  for (const d of data.sales_decisions) {
    const c = match(s.contacts, d.contact_email);
    if (c)
      s.decisions.push({
        ...d,
        contact_id: c.id,
        sequence: s.decisions.length,
        recorded_at: d.decided_at,
      });
  }
  for (const e of data.pipeline_events) {
    const c = match(s.contacts, e.contact_email);
    if (c)
      s.events.push({
        id: e.id,
        contact_id: c.id,
        type: e.type,
        occurred_at: e.occurred_at,
      });
  }
  s.pack = report(s);
  s.brief = await contentBrief(visibility()[0], "rules");
  return s;
}
