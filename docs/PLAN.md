# Build plan — 4 November 2026

This is a new TypeScript implementation in a separate repository. Only the original assignment pack was copied into source/. The earlier Python project remains unchanged. The technology choice follows the candidate's earlier Mail Risk Intelligence project: React, Express, Zod, SQLite, Vitest and Playwright.

1. Define shared contracts and deterministic identity, qualification and event-time reporting.
2. Implement validated extraction with a labelled offline fallback and bounded local Ollama calls; grounded content plans.
3. Add transactional SQLite persistence and a local Express API.
4. Build lead queue/detail, weekly record drilldowns and AI visibility views.
5. Test unseen inputs, failures, historical decisions, restart persistence and browser flows; verify local-model behavior separately.
6. Export the KPI pack and document setup, tradeoffs, actual AI assistance and remaining candidate-authored sections.

Acceptance: synthetic baseline is independently computed from supplied records; every counted event is traceable; unknown feed is never zero; score never bypasses five-condition QL gate. Tests and setup must work without a model or key. No outbound messaging, auth, integrations or deployment.
