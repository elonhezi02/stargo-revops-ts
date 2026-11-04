# Validation — 4 November 2026

New TypeScript implementation, tested on macOS Apple Silicon with Node 24.12.0. Only synthetic data was used.

- **39 Vitest/Supertest tests passed**: QL gate, owner/size boundaries, identity matching and conflicting identifiers, first touch, timezone boundaries, duplicate accepts, historical reject/current accept, evidence timing, earlier cohorts, unknown feeds, suppression, exact evidence, unsafe input, local-model HTTP failures, persistence, atomic revision conflicts, blank inputs and look-alike brands.
- TypeScript compilation, Vite production build and Prettier checks passed.
- **Two Playwright browser tests passed**: desktop weekly metric drilldown into Felix and lead evidence, plus 390 px new inbound → candidate → accepted QL, brief generation and no document overflow. Native dialog Escape handling was verified. Each run uses a fresh test database; a repeated-run selector issue found during testing was fixed.
- Desktop and mobile screenshots were visually inspected. Screenshots and browser data are ignored runtime artifacts, not submission inputs.
- Baseline report is 6 acquisition QLs, 4 booked, 3 held and 2 opportunities. Expansion is 1 accepted contact and 1 booked meeting. Historical-reactivation is unknown. Every metric includes record IDs. The generated CRO note is below 150 words.
- **Real local inference passed** with Ollama 0.34.4 and `qwen3:4b-instruct`, using the existing downloaded model cache. New positive buyer → QL candidate; explicit negative interest → nurture; hidden instructions and unsupported Arabic → needs review; generated constrained brief → ready with 50 words. The latter two input checks intentionally stop before model inference. This is a small smoke evaluation, not a multilingual benchmark.
- Default operation needs no key, live model or network. No external provider, email or CRM was called. Tests mock model failures; live inference used loopback only.
- Known non-blocking tool warnings: Node's built-in SQLite experimental status; upstream Zod pure-comment warnings from Vite; Playwright color environment warning. All relevant checks completed successfully despite these warnings.

Limits: no exhaustive security audit, universal prompt-injection detector, general semantic claim checker, broad model accuracy benchmark or production-scale concurrency test. Candidate personal review and first-person PROCESS.md remain to be completed.
