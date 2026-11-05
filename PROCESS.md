# Engineering process

AI-assisted editorial draft, updated 5 November 2026. Final personal review notes and time reporting remain open.

## Direction and technology selection

I chose to use a consistent technology stack across my Stargo assignments: TypeScript, React, Express, Zod and SQLite. Before committing to that direction, I asked Codex to compare the existing implementations with the assignment's permitted technologies and present a plan for my approval. I approved the TypeScript approach after that comparison.

I then requested a separate implementation and repository rather than modifying the existing project. This repository's build started on 4 November 2026. The original assignment pack supplies the requirements and synthetic data; its October reporting dates are independent of the development timeline.

## How I used AI

I worked with Codex as an implementation collaborator. I set the technology-consistency requirement, requested the comparison and plan before changes, approved the direction, and defined the separate-project boundary. Codex generated the application code and supporting tests, ran the automated checks, and prepared documentation drafts. I requested explanations of the architecture, local execution and requirement coverage throughout the work.

My instructions evolved through three concrete decisions. The following are summaries of the requests, not verbatim quotations:

- Compare the previous project's stack with the assignment constraints before proposing changes.
- Use the approved TypeScript stack in an independent implementation with its own documentation and Git repository.
- Complete the technical validation and prepare the application for a final review together.

This division let me control the scope and technology choices while using AI for implementation and verification. The implementation activity and observed results are recorded in [docs/AI_LOG.md](docs/AI_LOG.md) and [docs/VALIDATION.md](docs/VALIDATION.md).

## Design rationale

The implementation separates extraction from qualification. Agent A returns structured, evidence-linked facts; Agent B applies explicit qualification, exclusion and routing rules. A high priority score cannot replace recorded sales acceptance or override missing evidence.

The historical report uses event-time boundaries in Asia/Jerusalem and preserves earlier analyses when a lead is reanalyzed. This keeps current work from silently rewriting a past week's results. Missing feeds remain unknown, and expansion is reported separately.

Content generation is deliberately constrained: the model selects approved claims and a content structure, while factual sentences come from a source-tagged catalog. The tradeoff is reduced flexibility in exchange for traceable claims.

## Verification and review

The completed assistant-run checks include 39 offline tests, two browser flows, a clean archive installation and a local Ollama smoke test. The live test used `qwen3:4b-instruct` and covered positive and negative interest, safe review routing and a grounded content brief. These results describe what was exercised, not a claim of exhaustive correctness.

On 5 November, I requested clarification of the built-client and development run modes before continuing the review. I also requested a documentation audit against the brief, with a plan presented before edits.

The functional review is in progress. My final account will record observations from tracing two KPI counts, testing historical and current sales decisions, checking restart persistence, and inspecting qualification and failure handling. Any corrections resulting from that review will be recorded here.

## Time and next steps

- Personal time spent: **to be completed from my actual time records**.
- Development assistant: **Codex**.
- Application model exercised in the build: **qwen3:4b-instruct via local Ollama**.
- Final personal review and code walkthrough: **in progress**.

After the review, I will revise this account in my own words and complete the time report. The remaining technical limitations are documented in the README, particularly conservative language coverage, constrained content generation and the small-workspace storage design.
