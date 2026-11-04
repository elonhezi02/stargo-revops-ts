# Factual assistant activity — 4 November 2026

Documentation status: **4 November 2026**. Project chronology: [TIMELINE.md](TIMELINE.md).

This file is written by the assistant, not the candidate's personal account.

The user requested a new, separate implementation matching the earlier project's technology stack. Created `stargo-revops-ts` with a new Git repository and copied only the original assignment pack into source/. Implemented fresh TypeScript contracts, identity, extraction, qualification, reporting, persistence and Express routes, plus a new React interface. Existing projects were not edited.

Used Zod for runtime schemas and shared types, node:sqlite for durable state, Vitest/Supertest for backend checks and Playwright for browser flows. The first TypeScript check caught an owner field type intersection (contact owner versus nullable routed owner); corrected it. The initial browser run lacked the installed Playwright Chromium version; installed that runtime and reran. Prettier initially needed a second formatting pass on two files.

The independent seed report computed 6/4/3/2 with record-level traces. Tested a local Ollama service using the already-downloaded qwen3:4b-instruct model from the earlier project's model cache. Synthetic live cases covered positive and negative interest, instructions, unsupported language and content generation. This used external runtime assets for testing, not copied application code or a bundled model dependency.

Prepared README, review steps, generated KPI pack and packaging helpers. PROCESS.md is a process draft for candidate review; personal review notes and time reporting are pending. No subagents used. No email sent, repository pushed or site deployed.

The assistant visually inspected desktop/mobile screenshots and corrected a search-field layout and a holiday-brand detection pattern. Added explicit blank-input handling and corresponding regression tests. A repeated browser test initially selected a lead from the previous test database; changed the test to use a fresh database per run and the exact new lead name. The final offline suite has 39 tests, and the two browser flows passed again. See VALIDATION.md for measured results rather than inferring broader coverage.

Finally extracted the review archive into a fresh directory, installed dependencies from the lockfile, ran the full checks and verified the static UI/API baseline. Started the new application's offline preview on port 3002. The source pack was checked byte-for-byte against the original. Prepared a local review archive; no submission occurred.

At the user’s request, organized the repository documentation around the actual new-build start date, 4 November 2026, and added TIMELINE.md separating completed stages from planned personal review and submission. Assignment data timestamps and Git history were preserved.

Documentation edit: at the candidate’s request, replaced informal conversation excerpts in PROCESS.md with professional summaries of the actual direction, approval and project-scope decisions. The document remains an AI-assisted editorial draft for personal revision; automated verification is distinguished from the pending candidate review.
