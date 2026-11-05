# Validation record

Checks executed: **4 November 2026**. Documentation reviewed: **5 November 2026**. Environment: macOS Apple Silicon, Node.js 24.12.0, synthetic assignment data only.

## Completed checks

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
