# Architecture and extension points

Updated 8 November 2026 after the server-layer and client-feature refactor. The application uses explicit constructor/function dependency injection; it does not require a DI container or an agent framework.

## Request flow

```text
index.ts → composition.ts (configuration + concrete adapters)
  → http/app.ts → routes → controller (HTTP translation)
    → services/WorkspaceService (use cases)
      → ingestion / Agent A extraction / Agent B qualification
      → visibility audit / content brief
      → WorkspaceRepository → SQLite Store
```

`composition.ts` reads configuration once per application instance, creates the model adapter, binds prompts and wires the service. HTTP handlers delegate operations rather than construct agents or read environment variables. Changing `.env` requires restarting the API; it cannot switch a provider halfway through a request.

## Responsibilities

| Module                                                    | Responsibility                                                              |
| --------------------------------------------------------- | --------------------------------------------------------------------------- |
| `server/agents/prompts/extraction.ts`                     | Versioned Agent A instructions                                              |
| `server/agents/prompts/content-brief.ts`                  | Versioned grounded content planning instructions                            |
| `server/agents/extraction-agent.ts`                       | Rules-based extraction, model response validation and exact evidence checks |
| `server/domain/qualification.ts`                          | Deterministic Agent B: gates, score, exclusions and routing                 |
| `server/infrastructure/llm/ollama-adapter.ts`             | Ollama JSON transport with injected fetch, timeout and sanitized failures   |
| `server/services/ingestion-service.ts`                    | Validate inbound, resolve identity and append message/analysis              |
| `server/services/workspace-service.ts`                    | Workspace reads, intake, human decisions, reanalysis, briefs and exports    |
| `server/infrastructure/db/sqlite-workspace-repository.ts` | SQLite persistence, serialized writes and optimistic revision checks        |
| `server/infrastructure/data/seed.ts`                      | Initial fixture import; independent of HTTP                                 |
| `server/domain/reporting.ts`                              | Historical reporting and Markdown rendering                                 |
| `server/infrastructure/data/visibility.ts`                | Capture audit and gap ranking                                               |
| `server/agents/content-brief-agent.ts`                    | Approved claim catalog, constrained plan schema and rendering               |

Agent B deliberately has no prompt: the assignment's business gates are explicit code. Model output must pass validation before it contributes to qualification. Human acceptance remains a separate gate.

## Dependency injection

`WorkspaceService` accepts `WorkspaceDependencies`: a repository, extraction and brief functions, visibility and qualification functions, clock and identifier generator. The repository contract exposes `read` and transactional `update`; an alternative adapter must preserve rollback on failure, write serialization and revision-conflict semantics.

`createApp(path, options)` is the production/test composition root. `options.settings`, `options.generate`, `options.prompts` and `options.services` allow explicit overrides. The default composition owns the SQLite connection and closes it if initialization fails. `index.ts` closes it on shutdown. A custom application can construct `WorkspaceService` with another repository and pass it to `createHttpApp`.

Both model adapters implement the neutral `Generator` contract in `server/ports/model.ts`. The provider factory selects `rules`, `ollama` or `openai-compatible` from external configuration. `LLM_MODEL` selects the model, `LLM_ENDPOINT` selects the full local endpoint, and `LLM_TIMEOUT_MS` bounds inference. `OLLAMA_MODEL` remains a legacy alias. A new protocol needs one adapter and a factory entry; HTTP, use cases, prompts and evidence validation remain unchanged. All configured endpoints remain loopback-only, and redirects are blocked. The compatible adapter requires a local Chat Completions server with JSON-schema support; it has protocol tests but has not been live-tested with a second runtime.

Prompt text is multiline and versioned separately from model transport. Change the appropriate prompt and increment its version when instructions change. Custom prompt overrides still pass through the same evidence and content validators. Prompt versions are source metadata, not per-analysis audit fields in the current database schema.

## Preserved behavior and boundaries

- Seed imports deliberately use rules and an offline brief so first startup works without a model. Selecting Ollama affects new inbound, explicit reanalysis and brief generation; it does not silently rewrite historical analyses.
- Without model configuration, rules mode remains available. A failed Ollama call produces a review state, not a silent fallback to rules qualification.
- Seed data, identity matching, scoring weights, historical reporting windows, sales decisions and database format are unchanged.
- The React client consumes the same API and shared schemas through `client/api`. The state hook manages loading and mutations. Feature components own their screen and local UI state; shared layout and dialog components live under `client/components`.
- Business policies remain typed code rather than arbitrary configuration: changing a qualification gate must remain a deliberate, tested change.

## Verification

The regression suite preserves existing business behavior. Additional integration coverage runs independently configured application instances, injects a custom model and extraction prompt, verifies validated analysis, and checks the injected audit clock. Transport tests use injected fetch functions without changing global fetch. Browser and live Ollama smoke checks use separate databases.

## Repository map

```text
server/
  config/                 Environment and filesystem paths
  http/
    controllers/          Translate requests/responses; delegate use cases
    middleware/           Local-origin protection and safe error mapping
    routes.ts             URL-to-controller registration
    app.ts                Express assembly
  services/               Workspace and intake use cases
  domain/                 Identity, qualification and reporting policies
  agents/
    prompts/              Versioned prompt text, independent of transport
  ports/                  Neutral model and repository contracts
  infrastructure/
    db/                   SQLite repository
    data/                 Seed and visibility capture readers
    llm/                  Provider factory and protocol adapters
  composition.ts          Explicit dependency wiring and ownership
  index.ts                Process lifecycle
client/
  api/                    HTTP transport and named workspace operations
  hooks/                  Workspace loading, mutation and refresh state
  features/
    leads/                Queue, intake, checks, messages and sales decisions
    performance/          Weekly report and record drilldown
    visibility/           Gap review and grounded content display
  components/             Shared layout, dialog, badge and statistic
  lib/                    Shared presentation utilities
  App.tsx                 Coordinates views and dialogs
  main.tsx                React bootstrap
shared/                   Validated API/domain contracts
```

Controllers do not open databases or call model transports. Agents depend on the model port, not a provider SDK. Services depend on the repository contract, not SQLite. The composition root owns the production adapters. Keeping the public API unchanged allows the client and server internals to evolve separately.

The current service remains one cohesive workspace use case facade; splitting every endpoint into a one-method class would add indirection without improving this application's boundaries. Domain rules remain explicit, tested code rather than an unrestricted runtime rules engine.

## Review-driven architectural changes

The final structure reflects specific candidate review feedback: isolate prompts, expose controller/service/database boundaries, inject dependencies, make model replacement configurable and split the large client component. An initial extraction of functions was followed by a second structural pass because flat modules still obscured responsibilities. [PROCESS.md](../PROCESS.md#where-my-review-changed-the-implementation) records the observations, requested changes and resulting behavior.
