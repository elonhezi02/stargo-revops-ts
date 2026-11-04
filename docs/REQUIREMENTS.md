# Requirement mapping

| Brief section | Implementation | Verification |
|---|---|---|
| 1. Ingest/hygiene | source import, Zod input, tldts domains, email/LinkedIn identity, paste form | core identity/blank/source tests; API mutation; browser form |
| 2. Chained agents | validated Agent A output; deterministic Agent B, five checks, factors, routing, draft | core gates/exclusions/evidence; provider failures; live smoke |
| 3. Weekly KPI | Luxon Jerusalem window; stored decisions; first touch; separate expansion; record drilldown | boundary/duplicate/replay tests; browser trace; KPI_PACK.md |
| 4. Visibility | 24 captures, owned-domain checks, lookalike flags, ranked gaps, constrained claim-ID brief | visibility and contract tests; live generated plan; UI |
| 5. Storage | atomic SQLite document plus revision; persist all state | restart and conflict tests |
| 6. UI | React + TypeScript, queue/detail, decisions, report and visibility, 390 px | Playwright + visual inspection |
| Offline mode | rules-only analysis and explicitly labelled brief template | no-key baseline tests |
| Deliverables | Git, README, generated KPI pack, PROCESS worksheet and AI activity log | review archive includes Git; candidate personal process still pending |

Optional HubSpot sync and labelled evaluation benchmark are not implemented. See README for prioritization, assumptions and limitations.
