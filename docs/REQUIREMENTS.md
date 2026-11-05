# Requirement coverage

Reviewed 5 November 2026 against the [supplied brief](../source/Stargo_RevOps_Take_Home_Pack_v2/Stargo_RevOps_Engineer_Take_Home.md). Technical verification was recorded on 4 November in [VALIDATION.md](VALIDATION.md).

## Functional requirements

| Brief section                     | Implementation                                                                                              | Evidence                                                              | Status                                      |
| --------------------------------- | ----------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- | ------------------------------------------- |
| 1. Intake and hygiene             | First-run source import, paste form, Zod validation, email/LinkedIn matching and domain normalization       | Core identity and blank-input tests; API and browser intake flows     | Implemented                                 |
| 2. Two chained agents             | Validated extraction followed by deterministic QL gate, exclusions, scoring, routing and reply draft        | Gate/evidence tests, provider failure tests and local-model smoke run | Implemented                                 |
| 3. Weekly KPI pack                | Jerusalem window, stored decisions, first touch, event-time counts, separate expansion and record drilldown | Boundary/replay/counting tests; browser drilldown; generated KPI pack | Implemented                                 |
| 4. AI visibility                  | Capture audit, owned citations, look-alike flags, justified gap score and source-constrained brief          | Visibility/contract tests, local-model content plan and UI            | Implemented                                 |
| 5. Storage                        | SQLite workspace document with atomic revision updates                                                      | Restart and conflicting-write tests                                   | Implemented                                 |
| 6. React UI                       | Queue, lead detail, acceptance/rejection, report and visibility; 390 px layout                              | Playwright and screenshot inspection                                  | Implemented                                 |
| Model failure and untrusted input | Safe errors, schema/evidence validation and needs-review routing                                            | Offline failure mocks and blocked-input tests                         | Implemented; conservative language coverage |
| No-key execution                  | Labelled rules analysis and offline content template                                                        | Clean-install baseline                                                | Implemented                                 |

## Technology constraints

| Constraint                                         | Selected implementation                         |
| -------------------------------------------------- | ----------------------------------------------- |
| Python/FastAPI or Node.js/TypeScript               | Node.js, TypeScript and Express                 |
| React and TypeScript                               | React, TypeScript and Vite                      |
| Schema validation                                  | Zod shared contracts                            |
| SQLite or JSON persistence                         | SQLite containing a versioned JSON workspace    |
| Free-tier or local model                           | Local Ollama with qwen3:4b-instruct             |
| Environment example                                | .env.example; default execution requires no key |
| No real account integrations or automatic outbound | No CRM/email/social connectors or send endpoint |

## Deliverables

| Deliverable                                 | Location                                      | Status                                            |
| ------------------------------------------- | --------------------------------------------- | ------------------------------------------------- |
| Repository and history                      | Git repository; npm run package includes .git | Available for review                              |
| Setup, architecture, formulas and tradeoffs | [README.md](../README.md)                     | Documented                                        |
| Personal AI workflow and time               | [PROCESS.md](../PROCESS.md)                   | Draft; candidate review and actual hours required |
| Exported report and CRO note                | [KPI_PACK.md](../KPI_PACK.md)                 | Generated; CRO note below 150 words               |
| Submission message                          | Original assignment email thread              | Not sent                                          |
| Live walkthrough without AI                 | Candidate preparation                         | In progress                                       |

Optional HubSpot sync, a labelled model benchmark and a screen recording are not required for completion and are not included. Manual review steps are in [REVIEW.md](REVIEW.md).
