import { randomUUID } from "node:crypto";
import {
  InboundSchema,
  type State,
  type Message,
  type Analysis,
} from "../../shared/contracts.js";
import { linkedinKey, match } from "../domain/identity.js";
import { extract } from "../agents/extraction-agent.js";
export const uid = (prefix: string) => prefix + "-" + randomUUID();
export type Extractor = (
  body: string,
  contact: import("../../shared/contracts.js").Contact | undefined,
) => ReturnType<typeof extract>;
export interface IngestionDependencies {
  extract: Extractor;
  makeId: typeof uid;
}
export async function ingest(
  s: State,
  input: unknown,
  dependencies: IngestionDependencies = { extract, makeId: uid },
) {
  const { extract: extractor, makeId } = dependencies;
  const parsed = InboundSchema.parse(input);
  const linkedin = linkedinKey(parsed.linkedin_url);
  let c = match(s.contacts, parsed.from_email, linkedin);
  if (!c) {
    c = {
      id: makeId("C"),
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
    id: parsed.id ?? makeId("IN"),
    contact_id: c.id,
  };
  s.messages.push(message);
  const result = await extractor(message.body, c);
  const analysis: Analysis = {
    ...result,
    id: makeId("A"),
    contact_id: c.id,
    message_id: message.id,
    received_at: message.received_at,
    effective_at: message.received_at,
  };
  s.analyses.push(analysis);
  return c.id;
}
