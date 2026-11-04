# Stargo · Revenue workspace

A new local RevOps application implemented in TypeScript on 4 November 2026. React + Vite, Express, Zod and Node's SQLite driver. Original assignment data is synthetic. No authentication, external CRM connection or outbound messaging.

## Run with no model and no key

Requires **Node.js 24.12+** and npm. The lockfile records the tested dependencies. From this repository:

```sh
npm ci
npm run build
npm start
```

Open **http://127.0.0.1:3002**. No `.env` is required. Default mode is clearly labelled **Offline rules**. The first run imports the source pack once; restart preserves the same workspace. npm installation needs internet; normal rules-mode operation does not.

For development:

```sh
npm run dev
```

Open **http://127.0.0.1:5174**. Vite proxies `/api` to the Express server on 3002. Both bind to loopback. Production Express serves the built client and API together.

To use a separate fresh workspace, without deleting existing decisions:

```sh
DATABASE_PATH=runtime/reviewer.sqlite npm start
```

Stop your server with Control+C before starting another on the same port, or specify `PORT=3003`. Database and static paths resolve relative to the project. Data is stored in `runtime/revops.sqlite` by default.

## Local LLM (optional)

Install Ollama separately. The app's chosen provider is **local Ollama**, and the default model is **qwen3:4b-instruct**, matching the candidate's prior technology stack. No account or paid key is needed. If Ollama is already running, use that instance and `ollama pull qwen3:4b-instruct`. Otherwise, in separate terminals:

```sh
npm run model:serve
```

```sh
npm run model:pull
LLM_PROVIDER=ollama npm start
```

The model helper stores downloaded weights in ignored `runtime/models`. `OLLAMA_BIN` can point to an existing Ollama executable. The project does not bundle an executable or model weights.

Configuration (copy `.env.example` to `.env` if preferred):

| Variable | Default | Meaning |
|---|---|---|
| PORT | 3002 | API and production UI port |
| DATABASE_PATH | runtime/revops.sqlite | SQLite workspace |
| LLM_PROVIDER | rules | rules or ollama |
| OLLAMA_MODEL | qwen3:4b-instruct | Local model name |
| LLM_TIMEOUT_MS | 30000 | Request timeout, bounded at 60 seconds |

Only `http://127.0.0.1:11434/api/chat` is used for model inference. Redirects are blocked, thinking is disabled and the output is constrained by JSON schema. Failure yields `needs review`, never a silent positive fallback. Seed import deliberately uses rules so a missing model cannot block startup. Reanalyze a lead or add an inbound to exercise the configured model; stored results retain their original mode. Generating a brief also uses the configured provider. Existing offline briefs remain visibly labelled.

The live smoke script uses a disposable database and synthetic messages:

```sh
npm run test:live
```

It is intentionally separate from the offline test suite. Unsupported scripts and obvious instruction attacks are blocked before inference; this is conservative review routing, not a claim of universal multilingual accuracy.

## Review walkthrough

1. Open Anouk de Vries. Check the five conditions and exact evidence, score factors, owner, original messages and stored extraction.
2. Weekly performance initially shows **6 QLs / 4 booked / 3 held / 2 opportunities** against **25 / 15 / 12 / 5**. Click a card to open the record IDs. Felix's held meeting and opportunity belong to an earlier acquisition cohort and still count by event date.
3. Historical-reactivation is **unknown**, not zero. Expansion is separate: one accepted customer and one meeting booked.
4. Add a synthetic message with a buyer role, supported company size/sector/region, specific data problem and demo request. It should be a candidate until a human records acceptance.
5. Replay acceptance inside the reporting week using e.g. `2026-10-07T15:00:00+03:00`. A current decision does not change the old week. Seed cases include a duplicate acceptance, LinkedIn/email identity, free-email firmographics, non-English messages and hidden instructions.
6. Open AI visibility, inspect the top gap and engine-level citations, then generate the constrained brief. Review its BC/PP sources before using it.
7. Restart and verify state persistence. Export the pack in the UI or with `npm run export:kpi`.

## Architecture

```text
Source CSV / JSON or pasted inbound
  → Zod input + identity normalization
  → Agent A (rules or local LLM) → Zod + exact-evidence validation
  → Agent B (deterministic QL gate, score and routing) → Zod validation
  → SQLite state, append-only analyses and decisions
  → React queue / historical KPI pack / grounded visibility brief
```

- `shared/contracts.ts`: shared Zod schemas and inferred client/server types.
- `server/identity.ts`: email and LinkedIn person identity; domain normalization using a bundled public suffix list.
- `server/extraction.ts`, `server/model.ts`: literal extraction aids, bounded inference, evidence validation and safe errors.
- `server/qualification.ts`: five-condition gate, exclusions, score, ownership and reply templates.
- `server/reporting.ts`: Jerusalem week boundaries, first touch, events, traces and Markdown export.
- `server/visibility.ts`: synthetic capture audit, ranking and approved claim catalog.
- `server/storage.ts`: first import and SQLite persistence with revision checks.
- `server/app.ts`: local Express API. `client/`: responsive React workspace with native dialog focus containment.

Plain CSS keeps the layout small and auditable; Lucide provides consistent local SVG icons. No external fonts, analytics, remote images or agent framework are required.

### Agent split and grounding

Agent A's offline mode is a bounded recognizer for English plus the supplied Hebrew interest/problem and Dutch negative-interest patterns. Its live mode gives the model the message, matched CRM context and deterministic literal candidates. Candidates reduce omissions but are not permission to invent facts. Every returned quote must occur in the message, employee counts must match their quotes, and normalized role/sector/region/problem must be independently recognized. Unsupported language or vocabulary can therefore require human review even with a model. This trades recall for auditable evidence.

Agent B receives validated structured signals and CRM facts; it does not interpret raw message text. It scores company fit 30, relevant buyer 20, specific data problem 30 and expressed interest 20. Sales acceptance is a fifth required gate with zero points. A score of 100 cannot override a missing acceptance or an exclusion. Reply drafts are templates for human approval; there is no sending endpoint.

### Identity and temporal assumptions

- Person matching uses normalized email or exact LinkedIn profile only, never name, company or domain. Conflicting identifiers return an error. Without identifiers a new provisional person is created each time.
- Domains use tldts's offline public suffix data, preserving `.co.uk`, `.com.sg`, `.co.il`. Free email domains never create company identity. Company facts stated in a message are visibly marked unverified; colleagues' facts/sources are not inherited.
- The reporting window is `[4 Oct 2026 00:00, 9 Oct 2026 00:00)` in **Asia/Jerusalem**, calculated by Luxon/IANA timezone rules. Input timestamps require an offset. Date-only CRM deal creation is interpreted as UTC midnight because the source lacks finer precision.
- At the report cutoff the latest decision wins, with insertion sequence breaking equal-time ties. Repeated accepts count once. A within-week rejection removes the QL; a later current decision cannot rewrite that week. Qualification is checked using evidence available at acceptance time.
- Reanalysis appends a new effective-now version rather than replacing historical analysis. Explicitly backdated new messages/decisions are replay corrections and may change a historical pack.
- Existing customers are expansion. Deals predating the first inbound and acceptance are excluded. Where inbound is missing, an earlier recorded acceptance can establish the acquisition cohort for pipeline events (Felix); it does not manufacture a QL without message evidence.
- Meetings and opportunities are counted by their own event date. First-touch source comes only from that person's earliest inbound; blank is “source not recorded.” Missing feeds stay unknown and make overall totals partial.
- CRM shipper classification is accepted as supplied ICP context; no freight-spend figure is invented. Matching supplied senior logistics/procurement/transportation roles can satisfy buyer fit.

### Persistence and concurrency

SQLite stores a versioned JSON workspace document, including leads, raw messages, validated analyses, decisions, generated briefs and the materialized KPI pack. This is deliberately a small document store, not a production warehouse. Each write atomically updates document and revision. A per-process queue serializes mutations; revision comparison rejects cross-process lost updates with HTTP 409. Model calls happen before the short atomic write, so no database lock is held during inference. Restart reuses the workspace and does not duplicate the seed.

### Visibility and content contract

Score: `100 × priority/3 × (0.4 missing-mention rate + 0.3 missing-owned-citation rate + 0.2 flagged-claim rate + 0.1 competitor-presence rate)` across each prompt's three engines. Mention and owned evidence have higher weight because discovery and verifiability matter most. This is a prioritization heuristic, not a pipeline forecast.

Owned citations require exact hostname or real subdomain matching. Known wrong identity, look-alike domains and unsupported publication/review assertions are flagged. These are documented patterns, not general fact checking. All original captures remain inspectable.

The content model selects approved claim IDs, headings and FAQ questions. Every factual sentence is rendered from the local BC/PP catalog; arbitrary model prose cannot become a supported claim. The direct answer has 40–60 words, 3–5 sections, 3–4 FAQs (within the required 3–5), and schema.org Article. Repeated headings, invalid claim IDs and malformed plans are blocked. Offline output is explicitly “Offline template.” Constraining wording is a deliberate reduction in creativity for stronger grounding.

## Tests

```sh
npm test
npm run build
npm run format:check
# or all three:
npm run check
# Install browser once, then exercise actual UI:
npx playwright install chromium
npm run test:e2e
```

Vitest + Supertest cover core rules, identity, report boundaries, KPI traces, API mutations, persistence, concurrent writes, evidence validation and model failures with offline mocks. Playwright checks desktop and 390 px flows using a separate test database. `docs/VALIDATION.md` records actual outcomes, including the separately run live-model smoke test.

Node 24.12 emits an experimental warning for its built-in SQLite driver. This is the same driver family used in the earlier project; the tested runtime is pinned in the requirements above. The warning does not prevent operation. Vite may emit harmless upstream Zod comment-annotation warnings.

## Cuts and next steps

No optional HubSpot sync, email integration, authentication, deployment or uploads: the requested paste/seed workflow is implemented. No full semantic claim verifier, comprehensive multilingual parser, background job worker, full normalized database or production authorization. Local model calls can take tens of seconds and the UI shows a pending state. Next steps would be a broader labelled extraction evaluation, versioned prompts/model provenance, an explicit identity-resolution UI and async jobs with cancellation.

## Submission

- `KPI_PACK.md` is generated from stored decisions, with a CRO note under 150 words.
- `PROCESS.md` is a candidate worksheet and must be completed in the candidate's own first person, with honest personal hours. `docs/AI_LOG.md` records actual assistant activity.
- Commit reviewed work, then `npm run package` creates `../stargo-revops-ts-review.zip` including `.git` and excluding ignored runtime data, models, dependencies and `.env`.
- Nothing is sent or published automatically. Reply to the original assignment email only after final review, with repository/archive, total personal hours and the model actually used. The source brief's deadline and no-undisclosed-post-submission-changes rule still apply.
