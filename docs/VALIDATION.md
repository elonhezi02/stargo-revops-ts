# Validation record

Latest checks: **8 November 2026**. Documentation reviewed: **8 November 2026**. Environment: macOS Apple Silicon, Node.js 24.12.0, synthetic assignment data only.

## Current verification status

The current code passed **55 unit/API/adapter tests**, TypeScript/build/format checks, both desktop/mobile browser workflows and the real Ollama smoke test on 8 November. The compatible adapter has mocked protocol coverage only. **Clean archive installation was repeated successfully on 8 November** after the refactor and dependency updates (runtime revision `6e5344e`). The 4 November check below remains a historical baseline.

## Initial baseline — 4 November 2026

| Check                         | Result    | Coverage                                                                                                             |
| ----------------------------- | --------- | -------------------------------------------------------------------------------------------------------------------- |
| Vitest and Supertest          | 39 passed | Qualification, identity, time boundaries, counting, decisions, evidence, persistence, API errors and write conflicts |
| TypeScript, Vite and Prettier | Passed    | Type checking, production client build and source formatting                                                         |
| Playwright desktop            | Passed    | KPI drilldown, Felix's supporting record, lead evidence and dialog Escape handling                                   |
| Playwright at 390 px          | Passed    | New inbound, candidate status, acceptance, brief generation and no page overflow                                     |
| Screenshot inspection         | Completed | Desktop and mobile layout; local runtime artifacts                                                                   |
| Clean archive installation    | Passed    | Fresh extraction, npm ci, npm check, KPI export, static page and baseline API                                        |
| Local model smoke test        | Passed    | Ollama 0.34.4 with qwen3:4b-instruct; synthetic inputs in a disposable database                                      |

The tests cover owner and company-size boundaries, duplicate acceptance, first-touch attribution, missing feeds, prior cohorts, historical rejection/current acceptance, evidence timing, failed reanalysis, exact quotes, fabricated employee counts, blank inputs, look-alike brands and safe model errors. Browser runs use fresh databases; a repeated-run selector issue was corrected before the final successful run.

## Report reconciliation

| Acquisition metric | Observed | Target |
| ------------------ | -------: | -----: |
| Qualified leads    |        6 |     25 |
| Meetings booked    |        4 |     15 |
| Meetings held      |        3 |     12 |
| Opportunities      |        2 |      5 |

Expansion is separate: one accepted contact and one booked meeting. Historical-reactivation is unknown because its feed was not received. Every counted metric includes record IDs. The generated CRO note is under 150 words.

## Live-model outcomes

| Scenario                                                        | Observed result                        |
| --------------------------------------------------------------- | -------------------------------------- |
| New buyer with explicit company facts, problem and demo request | QL candidate                           |
| Explicit negative interest                                      | Nurture                                |
| Hidden instructions                                             | Needs review; blocked before inference |
| Unsupported Arabic input                                        | Needs review; blocked before inference |
| Constrained content plan                                        | Ready; 50-word direct answer           |

These results demonstrate a small local smoke test, not general model accuracy or multilingual coverage. Default no-key operation uses rules and does not contact a model. Live inference used loopback only.

## Packaging and known limitations

The tested archive contained Git history and excluded node_modules, runtime data and .env. The source pack matched the original files byte-for-byte. Installation required internet; rules-mode operation did not.

Non-blocking tool warnings concerned Node's experimental SQLite driver, upstream Zod comment annotations during the Vite build, and Playwright color settings. All listed checks completed successfully.

No exhaustive security audit, universal injection detector, general semantic claim checker or production-scale load test is claimed. The candidate's final manual review is separate from these assistant-run checks and remains in progress. Follow [REVIEW.md](REVIEW.md) to complete it.

## Architecture refactor — 6 November 2026

- `npm run check`: 40 tests passed, TypeScript/client build passed, formatting passed.
- `npm run test:e2e`: both desktop and 390 px workflows passed against an isolated SQLite database.
- `npm run test:live`: real `qwen3:4b-instruct` extraction returned QL candidate for the positive case and nurture for negative interest; unsafe instructions and unsupported language remained needs review; the grounded brief was ready with 50 words.
- Added a DI integration test for independent app configurations, a custom extraction prompt/model function and a controlled audit clock. Model transport tests now inject fetch directly.
- Local `/api/health` confirmed the review application still uses Ollama. Live test inputs were not added to the review database.
- No changes to the stored-state schema or qualification/reporting policies were required.

## Layered full-stack refactor — 8 November 2026

- `npm run check`: 51 tests passed; TypeScript, production build and formatting passed. TypeScript now also rejects unused locals and parameters.
- `npm run test:e2e`: both desktop and 390 px workflows passed after the client split. Generated desktop/mobile screenshots were inspected.
- `npm run test:live`: all five expected outcomes passed against real local Ollama (`qwen3:4b-instruct`); the generated brief contained 50 words.
- Provider coverage includes configurable local endpoints, compatible response parsing, malformed/error responses, provider selection and rejection of nonlocal endpoint configuration. The OpenAI-compatible adapter was tested with mocked HTTP responses only; no second local model runtime was installed or exercised.
- The running review server still reports Ollama. Automated mutations used isolated test databases; the user's workspace was not reset.

## Documentation verification — 8 November 2026

All 10 project-owned Markdown files were reviewed for current module paths, run/configuration guidance, verification status and deliverables. Relative links and explicit code paths were checked. KPI_PACK.md matches a fresh in-memory seed export byte-for-byte after trimming trailing whitespace; its CRO note is 78 words. No review database was modified. PROCESS.md records the candidate-reported estimate of approximately 4 personal hours and retains final personal sign-off as an open step.

## Final archive verification — 8 November 2026

Runtime revision `6e5344e` was packaged with Git history, extracted into a fresh temporary directory and checked with `npm ci`, `npm run check`, `npm run test:e2e`, `npm run export:kpi` and `npm audit`. All 51 tests and both browser workflows passed. The exported KPI_PACK.md exactly matched the committed report. Installation findings were resolved with csv-parse 7.0.3 and Vitest 5.1.0; the resulting audit reported zero known vulnerabilities. This is the audit's result at verification time, not a guarantee of absence of all vulnerabilities.

The final packaging pass adds this verification record without changing the tested application or lockfile. Archive contents are checked against the tested runtime files. Git history is included; .env, runtime databases, model weights and node_modules are excluded. Candidate personal sign-off and submission remain separate from this technical verification.

## Post-refactor cleanup and requirement audit — 8 November 2026

The final source audit compared the implementation with the supplied brief, QL standard and brand content contract. TypeScript's unused-local/parameter checks passed. An import-graph scan from application, test and script entry points found no unreachable source modules, and every production dependency had a source import. Internal-only schemas, content planning values and report boundaries were made private to their modules.

Two issues were corrected: the model download helper now respects LLM_MODEL before the legacy OLLAMA_MODEL alias, and lowercase English “us” no longer creates a United States company fact. Four regression cases cover the ambiguous pronoun and explicit US/USA/United States evidence. A fake CLI check confirmed helper configuration precedence without downloading a model.

The updated suite passed 55 tests, build/format checks and both browser flows. npm audit reported zero known vulnerabilities. Existing rule/language limitations remain documented; this audit is not a claim of universal semantic extraction accuracy. The original source pack and review database were not modified.
