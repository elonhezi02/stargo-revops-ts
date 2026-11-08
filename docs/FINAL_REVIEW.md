# Final technical review

8 November 2026. This is a Codex-assisted technical review and a concise preparation guide. It does not certify an independent candidate walkthrough.

## End-to-end request trace

1. `client/features/leads/NewInboundDialog.tsx` collects the inbound fields.
2. `client/api/workspace.ts` sends the request; `hooks/useWorkspace.ts` handles pending/error state and refresh.
3. `server/http/routes.ts` dispatches to `controllers/workspace-controller.ts`, which translates HTTP input/output.
4. `services/workspace-service.ts` runs the operation through the repository; `ingestion-service.ts` validates input, matches identity and records the message and analysis.
5. Agent A extracts structured facts using the configured provider. Zod and exact-evidence checks validate the response. Failures remain reviewable.
6. `domain/qualification.ts` evaluates validated evidence and CRM context. Four factors total 100 points; human acceptance is a separate required gate.
7. The SQLite repository serializes updates, recomputes the historical report and persists the workspace with a revision check.

New inbound is **not** automatically accepted because it has a high score. The UI records a distinct human decision and never sends the reply draft.

## Two reconciled KPI traces

For a clean seed, acquisition qualified leads total **6**: SD-002, SD-001, SD-004, SD-007, SD-009 and SD-008. The target is 25. Source attribution uses each person's first inbound, not their latest message.

Meetings held total **3**: PE-002, PE-005 and PE-008. The target is 12. Felix's PE-002 belongs to the week by its event timestamp even though his acquisition cohort is earlier. This explains why meeting counts cannot be derived solely from this week's new QLs.

The report window is `[4 October 00:00, 9 October 00:00)` in Asia/Jerusalem. Current decisions do not rewrite the October result. Explicit backdated corrections can. Expansion is separate; the missing reactivation feed remains unknown.

## Maintainability and model replacement

The composition root selects adapters and injects dependencies. A configured supported provider can change through `LLM_PROVIDER`, `LLM_MODEL` and `LLM_ENDPOINT`. A new protocol requires an adapter implementing `Generator` and a factory entry. Controllers and qualification rules do not need provider-specific changes.

The client separates feature components from the API adapter and shared layout. A presentation change belongs in the appropriate feature/component; a business rule belongs in the domain layer with targeted regression coverage.

## Verification and limits

See [VALIDATION.md](VALIDATION.md) for recorded automated and clean-install results. Offline tests exercise qualification, identity, historical reporting, persistence, concurrent writes and model errors. Browser workflows cover report drilldown, intake, sales approval and brief generation. Real Ollama smoke tests are distinct from mocked compatible-provider tests.

The main limitations remain conservative extraction coverage, constrained content wording and a small-workspace document database. Prompt injection checks are bounded heuristics, not a universal detector.

## Personal preparation before the live session

Read the traced modules and explain the score-versus-acceptance distinction, the two KPI traces and provider replacement without assistance. Practice a small presentation change and run its relevant check. Confirm that PROCESS.md expresses the work in your own words and that the approximately four-hour estimate remains accurate. These personal steps are separate from the completed automated review.
