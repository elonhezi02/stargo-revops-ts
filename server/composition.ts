import { type Generator } from "./ports/model.js";
import { join } from "node:path";
import { config, ROOT } from "./config/environment.js";
import { createHttpApp } from "./http/app.js";
import { Store } from "./infrastructure/db/sqlite-workspace-repository.js";
import { uid } from "./services/ingestion-service.js";
import { extract } from "./agents/extraction-agent.js";
import { visibility } from "./infrastructure/data/visibility.js";
import { contentBrief } from "./agents/content-brief-agent.js";
import { qualify } from "./domain/qualification.js";
import { createModel } from "./infrastructure/llm/provider-factory.js";
import { extractionPrompt } from "./agents/prompts/extraction.js";
import { briefPrompt } from "./agents/prompts/content-brief.js";
import {
  WorkspaceService,
  type WorkspaceDependencies,
} from "./services/workspace-service.js";

export interface AppOptions {
  settings?: ReturnType<typeof config>;
  generate?: Generator;
  prompts?: { extraction: string; brief: string };
  services?: Partial<
    Omit<WorkspaceDependencies, "repository" | "provider" | "model">
  >;
}
/** Composition root: resolve configuration once and explicitly wire adapters. */
export async function createApp(path?: string, options: AppOptions = {}) {
  const settings = { ...(options.settings ?? config()) };
  const call = options.generate ?? createModel(settings);
  const store = new Store(path ?? settings.database);
  try {
    await store.initialize();
    const service = new WorkspaceService({
      repository: store,
      provider: settings.provider,
      model: settings.model,
      extract: (body, contact) =>
        extract(
          body,
          contact,
          settings.provider,
          call,
          options.prompts?.extraction ?? extractionPrompt.system,
        ),
      contentBrief: (gap) =>
        contentBrief(
          gap,
          settings.provider,
          call,
          options.prompts?.brief ?? briefPrompt.system,
        ),
      visibility,
      qualify,
      now: () => new Date(),
      makeId: uid,
      ...options.services,
    });
    return {
      app: createHttpApp(service, join(ROOT, "dist")),
      store,
      service,
      settings,
    };
  } catch (error) {
    store.close();
    throw error;
  }
}
