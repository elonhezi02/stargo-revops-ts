# AI-assisted development record

Build date: 4 November 2026. Last documentation update: 5 November 2026.

This supporting record describes Codex activity. The candidate's decisions, personal review and time report belong in [PROCESS.md](../PROCESS.md).

## Direction and scope

The candidate requested a technology comparison against the assignment constraints, approved a TypeScript stack consistent with the earlier Mail Risk Intelligence project, and requested an independent implementation. The new repository uses the original assignment pack; existing application projects were left unchanged.

The actual instructions were to compare technologies before proposing changes, implement the approved stack in a separate project, and complete technical validation before final review. These are summaries of the conversation, not verbatim quotations.

## Implementation work

Codex generated shared Zod contracts; identity normalization; evidence-validated extraction; deterministic qualification and routing; event-time reporting; SQLite persistence; Express routes; and the React review interface. It also prepared automated tests, local-model helpers, KPI export, packaging and documentation drafts.

The candidate directed scope and technology decisions. Implementation fixes and automated verification described below were carried out by Codex.

## Findings and corrections

| Finding                                                                              | Correction                                                         | Verification             |
| ------------------------------------------------------------------------------------ | ------------------------------------------------------------------ | ------------------------ |
| Contact ownership and nullable routing ownership produced a TypeScript type conflict | Separated the client lead type from the stored contact-owner field | TypeScript compilation   |
| Missing browser runtime prevented the initial Playwright launch                      | Installed the required Chromium runtime                            | Browser tests rerun      |
| Search-field layout needed correction                                                | Adjusted the field's flex direction                                | Screenshot inspection    |
| Holiday-brand references could be mistaken for Stargo mentions                       | Extended the look-alike detection pattern                          | Targeted regression test |
| Blank identity/source fields needed explicit normalization                           | Accepted blank values as missing data                              | Intake regression test   |
| Repeated browser runs selected an earlier test contact                               | Used a fresh test database and exact contact selector              | Both browser flows rerun |

## Verification evidence

The completed 4 November run included 39 offline tests, TypeScript/build/format checks, two browser workflows, visual screenshot inspection and clean archive installation. The seed report computed 6/4/3/2 with supporting record IDs.

A local Ollama run used the already-downloaded `qwen3:4b-instruct` model. Positive and negative interest and content generation exercised real inference. Obvious instructions and unsupported Arabic were routed to review before inference. The test database was disposable. Full outcomes and limits are in [VALIDATION.md](VALIDATION.md).

## Documentation review — 5 November 2026

At the candidate's request, the documentation was audited against the supplied brief. The review guide was rewritten in English, local run modes were clarified, document responsibilities were separated, and links and status dates were checked. Original source files and the generated reporting scenario were preserved.

No candidate hours have been supplied. The final personal review remains in progress. No submission email, repository push or deployment was performed as part of this work.
