# AI-assisted development record

Updated 8 November 2026. This record complements the first-person account in [PROCESS.md](../PROCESS.md) with implementation scope and verification evidence.

## Working approach

The candidate directed technology alignment, local-model selection, interface corrections and architectural review. Codex assisted with implementation, refactoring, automated tests and documentation. The scope included shared schemas, identity normalization, extraction validation, qualification, reporting, persistence, HTTP endpoints and the React interface.

Actual instruction excerpts, translated from Hebrew, are recorded in PROCESS.md. The table below distinguishes review decisions from implementation and verification rather than treating generated output as independently reviewed work.

## Iterations and evidence

| Date       | Review decision or finding                                               | Implementation response                                                                                       | Verification                                                                                    |
| ---------- | ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| 4 November | Use the permitted TypeScript stack in an independent repository          | Implement intake, chained extraction/qualification, reporting, persistence and UI                             | 39 tests, build/format checks, browser flows, Ollama smoke and initial archive installation     |
| 5 November | Make documentation consistent and suitable for review                    | English review guide, clearer run modes and document responsibilities                                         | Documentation cross-check                                                                       |
| 6 November | Sales acceptance shown as `0/0` was misleading                           | Separate the human decision from four scored automated checks                                                 | Browser workflows and build                                                                     |
| 6 November | Prompts and dependencies needed clearer boundaries                       | Versioned prompts, composition root, injected service and model transport                                     | 40 tests, browser workflows and Ollama smoke                                                    |
| 8 November | Flat modules and a large client component remained difficult to navigate | Explicit HTTP/services/domain/ports/infrastructure folders; client features, components, hook and API methods | 51 tests, browser workflows, screenshot inspection and Ollama smoke                             |
| 8 November | Model selection should be configurable                                   | Provider factory and local OpenAI-compatible transport alongside Ollama                                       | Mocked protocol, error and endpoint validation tests; Ollama remains the live-verified provider |

Earlier technical corrections included nullability in owner types, blank identity/source normalization, look-alike brand detection and isolated browser test data. These findings informed the regression coverage.

## Evidence boundaries

[VALIDATION.md](VALIDATION.md) records current results and separates earlier archive verification from checks on the current code. Automated execution does not replace the candidate's final independent walkthrough. Personal hours and submission status are tracked in PROCESS.md; they are not inferred from tool runtime or conversation duration.
