import { DatabaseSync } from "node:sqlite";
import { mkdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { randomUUID } from "node:crypto";
import { parse } from "csv-parse/sync";
import { DATA } from "./config.js";
import {
  InboundSchema,
  type Contact,
  type State,
  type Message,
  type Analysis,
} from "../shared/contracts.js";
import { emailKey, linkedinKey, domainKey, match } from "./identity.js";
import { extract } from "./extraction.js";
import { report } from "./reporting.js";
import { contentBrief, visibility } from "./visibility.js";
import type { Generator } from "./model.js";
export const uid = (prefix: string) => prefix + "-" + randomUUID();
export async function ingest(
  s: State,
  input: unknown,
  provider = "rules",
  call?: Generator,
) {
  const parsed = InboundSchema.parse(input);
  const linkedin = linkedinKey(parsed.linkedin_url);
  let c = match(s.contacts, parsed.from_email, linkedin);
  if (!c) {
    c = {
      id: uid("C"),
      first_name: parsed.from_name,
      last_name: "",
      email: parsed.from_email,
      linkedin_url: linkedin,
      company_name: "",
      company_domain: null,
      country: "",
      vertical: "",
      employees: null,
      job_title: "",
      is_customer: false,
      open_deal_id: "",
      open_deal_created: "",
      owner: "",
      lead_status: "",
    };
    s.contacts.push(c);
  } else {
    if (parsed.from_email) c.email ??= parsed.from_email;
    if (linkedin) c.linkedin_url ??= linkedin;
  }
  const message: Message = {
    ...parsed,
    linkedin_url: linkedin,
    id: parsed.id ?? uid("IN"),
    contact_id: c.id,
  };
  s.messages.push(message);
  const result = await extract(message.body, c, provider, call);
  const analysis: Analysis = {
    ...result,
    id: uid("A"),
    contact_id: c.id,
    message_id: message.id,
    received_at: message.received_at,
    effective_at: message.received_at,
  };
  s.analyses.push(analysis);
  return c.id;
}
async function seed(): Promise<State> {
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
export class ConflictError extends Error {}
export class Store {
  readonly db: DatabaseSync;
  private tail: Promise<unknown> = Promise.resolve();
  constructor(path: string) {
    if (path !== ":memory:") mkdirSync(dirname(path), { recursive: true });
    this.db = new DatabaseSync(path);
    this.db.exec(
      "PRAGMA journal_mode=WAL; PRAGMA busy_timeout=3000; CREATE TABLE IF NOT EXISTS workspace(id INTEGER PRIMARY KEY CHECK(id=1),revision INTEGER NOT NULL,document TEXT NOT NULL)",
    );
  }
  async initialize() {
    if (!this.db.prepare("SELECT id FROM workspace WHERE id=1").get()) {
      const s = await seed();
      this.db
        .prepare("INSERT OR IGNORE INTO workspace VALUES(1,?,?)")
        .run(s.revision, JSON.stringify(s));
    }
  }
  read(): State {
    const row = this.db
      .prepare("SELECT document FROM workspace WHERE id=1")
      .get() as { document: string };
    const state = JSON.parse(row.document) as State;
    if (state.version !== 1) throw new Error("Unsupported database version");
    return state;
  }
  update<T>(action: (s: State) => Promise<T> | T): Promise<T> {
    const task = this.tail.then(async () => {
      const s = this.read();
      const revision = s.revision;
      const result = await action(s);
      s.revision++;
      s.pack = report(s);
      const write = this.db
        .prepare(
          "UPDATE workspace SET revision=?,document=? WHERE id=1 AND revision=?",
        )
        .run(s.revision, JSON.stringify(s), revision);
      if (write.changes !== 1)
        throw new ConflictError("Workspace changed. Please retry.");
      return result;
    });
    this.tail = task.catch(() => undefined);
    return task;
  }
  close() {
    this.db.close();
  }
}
