# Engineering process

Updated 8 November 2026. Working account prepared with editorial AI assistance; final personal sign-off remains to be completed before submission.

## Objectives and technical direction

I prioritized a consistent TypeScript stack across my Stargo assignments: React, Express, Zod and SQLite, with Ollama for local inference. Before approving implementation, I requested a comparison with the permitted technologies and a plan. I chose a separate repository so the assignment could be reviewed and run independently.

My main acceptance criteria were traceable qualification, an auditable reporting window, explicit human approval and a codebase that is straightforward to navigate and extend. The source pack's October dates are business scenario data; this implementation began on 4 November 2026.

## AI workflow and responsibilities

I used Codex for implementation, refactoring, test execution and documentation assistance. I directed scope and technology selection, reviewed the interface and structure, and requested corrections when the implementation did not meet my expectations. The generated implementation and tests were checked through automated regression suites and a local-model smoke run. My final independent code walkthrough remains open.

The following are translated excerpts from my actual Hebrew instructions, rather than reconstructed prompts:

| Stage                  | Instruction excerpt, translated into English                                                                                                                               | Result                                                                                                          |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| Technology alignment   | “I want to use technologies according to the instructions, but also similar to what I used in the previous assignment, to maintain technological consistency if possible.” | Compare the permitted stack before implementation.                                                              |
| Local inference        | “I prefer that we do this using an Ollama model, as we did in the previous assignment.”                                                                                    | Use local model inference for new analyses and content planning while retaining the required no-model fallback. |
| Human approval display | “Fix this display issue as well; it is indeed confusing and looks like part of the agent's analysis.”                                                                      | Separate sales acceptance from the scored automated checks.                                                     |
| Dependency injection   | “Review the architecture in general and see what else you can improve … using DI, so everything is flexible and can be changed and adapted.”                               | Centralize dependency wiring and separate versioned prompts from transport calls.                               |
| Full-stack structure   | “A web service should contain a controller, service, DB, etc. … In the client too … it looks like everything is in one component.”                                         | Organize server layers and split the client into features, shared components, a state hook and API methods.     |

I allowed implementation work to proceed within the agreed scope, then used review findings to steer the next iteration. The architecture required a second pass: extracting functions alone did not provide the folder structure and discoverability I wanted. I requested explicit layer boundaries and a feature-based client organization rather than accepting the first refactor as complete.

## Where my review changed the implementation

My contribution included identifying gaps in the generated result and setting concrete requirements for the next iteration. The following changes came directly from my review:

| What I observed                                                                                 | My intervention                                                                                | Effect on the delivered project                                                                                      |
| ----------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| The technology choices needed to align with my previous assignment while satisfying this brief. | I required a comparison and plan before approving the TypeScript direction.                    | A consistent React/TypeScript/Express stack in an independent repository.                                            |
| The application was demonstrating rules-based extraction when I wanted local model inference.   | I explicitly requested Ollama and asked when the model was actually invoked.                   | Real local inference for new inbound, reanalysis and content planning, with the required labelled fallback retained. |
| Sales acceptance displayed `0/0`, making it look like incomplete agent analysis.                | I identified the ambiguity and requested a display correction.                                 | A distinct human-decision section, separate from the four scored automated checks.                                   |
| Prompt instructions were embedded in model calls.                                               | I requested a dedicated prompt area consistent with the previous project.                      | Readable, versioned prompt files separate from provider transport.                                                   |
| The initial refactor still left a flat server structure and a large client component.           | I requested explicit controller/service/database boundaries, DI and client decomposition.      | Layered server folders, neutral dependency contracts and feature-based React components.                             |
| Replacing a model should not require changes across business logic.                             | I used provider replacement through external settings as a concrete extensibility requirement. | A provider factory, model adapters and configuration for provider, model and local endpoint.                         |
| Documentation contained inconsistent language and no longer matched the code.                   | I requested an English documentation audit against the assignment and final architecture.      | Updated architecture, requirement coverage, configuration guidance and validation records.                           |

The first architecture revision did not resolve the navigation problem I had raised. I asked for another pass with visible folder boundaries and smaller client components. That review changed the organization of the delivered code, rather than only its description.

Codex implemented these requested changes and ran the automated checks. My role in these iterations was technical direction, product review and correction of the generated result. The documented interventions are review decisions; they are not a claim that I manually authored every resulting code change.

## Design decisions and tradeoffs

- **Extraction versus qualification:** the model extracts evidence-linked facts; deterministic code applies qualification gates, exclusions, routing and scoring. A score of 100 cannot replace recorded sales acceptance.
- **Historical integrity:** reports use event-time boundaries in Asia/Jerusalem. Reanalysis appends a current version, allowing the earlier reporting period to retain its evidence history.
- **Grounded content:** the model selects approved claim IDs and structure. Rendering uses source-tagged catalog text, trading free-form creativity for traceability.
- **Replaceable infrastructure:** model and repository contracts separate use cases from concrete transports and SQLite. Provider, model and local endpoint are externally configured.
- **Scope control:** SQLite's versioned workspace document suits this local dataset. A normalized production database, background jobs, comprehensive language evaluation and real account integrations are outside this submission's implemented scope.

## Verification evidence

The latest automated run on 8 November passed **55 tests**, TypeScript/build/format checks and two browser workflows, including a 390 px viewport. A real `qwen3:4b-instruct` run covered positive and negative interest and a grounded 50-word brief; unsafe instructions and unsupported Arabic were routed to review before inference. These checks were executed with Codex assistance against isolated test databases.

The additional OpenAI-compatible adapter has mocked protocol and failure tests; it has not been exercised against a second installed inference runtime. The 8 November archive passed clean installation, all 51 tests, build/format checks, both browser workflows and KPI export reconciliation. Dependency findings identified during installation were resolved by updating Vitest and csv-parse; npm audit then reported zero known vulnerabilities. Full evidence is in [VALIDATION.md](docs/VALIDATION.md).

## Final personal review and time report

- Personal time spent: **approximately 4 hours**, as reported on 8 November 2026; this is an estimate, not an instrumented time log.
- Development tool: **Codex**.
- Live application model: **qwen3:4b-instruct via Ollama**.
- Independent walkthrough, including two KPI traces and a small code change: **in progress**.
- Technical review and clean archive validation: **completed with Codex assistance on 8 November**.
- Submission: **not sent**.

Before submission I will confirm the final time estimate, review this account in my own words and record the remaining walkthrough results. This document does not claim completion of those steps.
