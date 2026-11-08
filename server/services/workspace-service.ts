import {
  DecisionSchema,
  type State,
  type Workspace,
  type Gap,
  type Brief,
} from "../../shared/contracts.js";
import type { WorkspaceRepository } from "../ports/workspace-repository.js";
import { ingest, uid, type Extractor } from "./ingestion-service.js";
import { qualify, parts } from "../domain/qualification.js";
import { markdown } from "../domain/reporting.js";

export interface WorkspaceDependencies {
  repository: WorkspaceRepository;
  provider: string;
  model: string;
  extract: Extractor;
  contentBrief: (gap: Gap) => Promise<Brief>;
  visibility: () => Gap[];
  qualify: typeof qualify;
  now: () => Date;
  makeId: typeof uid;
}
export class WorkspaceService {
  constructor(private readonly deps: WorkspaceDependencies) {}
  health() {
    return {
      status: "ok",
      provider: this.deps.provider,
      model: this.deps.model,
      outbound_enabled: false,
    };
  }
  workspace(): Workspace {
    const s = this.deps.repository.read();
    return {
      revision: s.revision,
      provider: this.deps.provider,
      model: this.deps.model,
      leads: s.contacts
        .map((c) => ({
          ...c,
          name: `${c.first_name} ${c.last_name}`.trim(),
          ...parts(s, c.id),
          ...this.deps.qualify(s, c),
        }))
        .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name)),
      pack: s.pack!,
      gaps: this.deps.visibility(),
      brief: s.brief,
      rejected: s.rejected,
    };
  }
  addLead(input: unknown) {
    return this.deps.repository.update((s) =>
      ingest(s, input, {
        extract: this.deps.extract,
        makeId: this.deps.makeId,
      }),
    );
  }
  decide(id: string, input: unknown) {
    const decision = DecisionSchema.parse(input);
    return this.deps.repository.update((s) => {
      this.contact(s, id);
      const row = {
        ...decision,
        id: this.deps.makeId("SD"),
        contact_id: id,
        sequence: s.decisions.length,
        recorded_at: this.deps.now().toISOString(),
      };
      s.decisions.push(row);
      return row;
    });
  }
  reanalyze(id: string) {
    return this.deps.repository.update(async (s) => {
      const c = this.contact(s, id);
      for (const m of s.messages.filter((m) => m.contact_id === id)) {
        const result = await this.deps.extract(m.body, c);
        s.analyses.push({
          ...result,
          id: this.deps.makeId("A"),
          contact_id: id,
          message_id: m.id,
          received_at: m.received_at,
          effective_at: this.deps.now().toISOString(),
        });
      }
    });
  }
  brief() {
    return this.deps.repository.update(
      async (s) =>
        (s.brief = await this.deps.contentBrief(this.deps.visibility()[0])),
    );
  }
  export() {
    return markdown(
      this.deps.repository.read().pack!,
      this.deps.visibility()[0],
    );
  }
  private contact(s: State, id: string) {
    const c = s.contacts.find((c) => c.id === id);
    if (!c) throw Object.assign(new Error("Lead not found"), { status: 404 });
    return c;
  }
}
