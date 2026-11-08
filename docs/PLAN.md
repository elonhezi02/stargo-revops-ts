# Implementation plan

Established 4 November 2026; status reviewed 8 November 2026.

## Objective

Build a local application that turns inbound GTM signals into qualified, routed leads, a traceable weekly KPI report and prioritized AI-visibility gaps. Prioritize correctness of intake, qualification and reporting before presentation and optional integrations.

## Technical approach

Use TypeScript across Express and React, Zod for shared contracts, SQLite for persistent state and Ollama for local inference. This matches the candidate's established stack and the assignment's permitted technologies. A labelled rules mode allows a complete no-key review.

| Stage                            | Scope                                                                                          | Acceptance criterion                                                                        | Status                 |
| -------------------------------- | ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- | ---------------------- |
| Contracts and identity           | Input schemas, email/LinkedIn matching, domain normalization                                   | Invalid input is rejected; identity conflicts do not merge people                           | Implemented and tested |
| Qualification                    | Evidence extraction, five-condition gate, exclusions, score and routing                        | Every check is inspectable; score cannot override acceptance or exclusions                  | Implemented and tested |
| Reporting                        | Jerusalem window, first touch, event counts and expansion                                      | Counts reconcile to records; missing feeds remain unknown                                   | Implemented and tested |
| Persistence and API              | Seed import, atomic writes, decisions and analysis versions                                    | Restart preserves state; conflicting writes cannot silently overwrite it                    | Implemented and tested |
| UI and visibility                | Lead review, metric drilldown, gap ranking and grounded content                                | Core workflows work at 390 px; unsupported content is blocked                               | Implemented and tested |
| Architecture and maintainability | HTTP/services/domain/ports/infrastructure layers; client features; configurable model adapters | Replace infrastructure without rewriting use cases; preserve the API and reporting behavior | Implemented and tested |
| Delivery review                  | Personal walkthrough, process account and final archive                                        | Candidate verifies the result and records actual time and observations                      | In progress            |

## Scope decisions

The required seed and paste workflows take precedence over file uploads or external integrations. Qualification is deterministic; the model extracts facts and selects a constrained content plan. SQLite stores a versioned workspace document, appropriate for the supplied dataset and a local review tool.

Optional HubSpot sync and a broad labelled model benchmark are omitted. Further work would focus on extraction coverage, asynchronous model jobs and explicit identity-resolution workflows. Detailed assumptions and formulas are in the [README](../README.md).

The [timeline](TIMELINE.md) records actual milestones. The [requirement map](REQUIREMENTS.md) links scope to implementation and verification.
