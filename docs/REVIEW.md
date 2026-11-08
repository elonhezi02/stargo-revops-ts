# Review guide

Updated 8 November 2026. This guide provides reproducible review scenarios and expected outcomes. Recorded automated results are in [VALIDATION.md](VALIDATION.md).

## Prepare an isolated workspace

From the repository root, install dependencies and build the application:

```sh
npm ci
npm run build
DATABASE_PATH=runtime/review.sqlite npm start
```

Open [the local application](http://127.0.0.1:3002). Use a previously unused database filename for a fresh seed. Stop any existing application server with Control+C before starting another on the same port. Do not delete the working database to reset a review.

For code changes during review, stop the server and run:

```sh
DATABASE_PATH=runtime/review.sqlite npm run dev
```

Open [the development UI](http://127.0.0.1:5174). These are alternative launch modes, not independent data environments. Both use the configured SQLite file.

## 1. Trace a qualification decision

Open **Anouk de Vries** in the lead queue.

- Expected status: **QL**; score: **100**; owner: **Dana**.
- Inspect all five checks and distinguish CRM facts, message quotes and recorded sales acceptance.
- Read the original inbound describing approximately 400 spot-rate requests per week and 3–4 hours per quote.
- Confirm that the reply is a draft and there is no send action.

Explain why satisfying the four scored conditions without sales acceptance would produce **QL candidate**, even at a score of 100. Use a new test contact for this scenario rather than changing the supplied baseline.

## 2. Trace the weekly report

Open **Weekly performance**. The clean acquisition baseline is:

| Metric          | Observed | Target |
| --------------- | -------: | -----: |
| Qualified leads |        6 |     25 |
| Meetings booked |        4 |     15 |
| Meetings held   |        3 |     12 |
| Opportunities   |        2 |      5 |

Open at least two metric drilldowns. Meetings held should include **PE-002, PE-005 and PE-008**. Felix's event belongs to the reporting week even though his sales acceptance belongs to an earlier cohort.

Confirm that historical-reactivation is **unknown**, not zero, and that one accepted expansion contact and one expansion meeting are reported separately. Verify Pieter's first-touch source remains event-email despite his later LinkedIn message.

## 3. Exercise intake and sales decisions

Add a synthetic contact with a unique email and a received timestamp of `2026-10-05T12:00:00+03:00`. Leave source blank and use this message:

> I own a 45-person customs brokerage in Haifa. We handle import declarations manually. Can we see a demo?

Expected result: **QL candidate**, score **100**, owner **Noa**. The firmographics must be marked stated and unverified.

1. Accept at `2026-10-07T15:00:00+03:00`. The historical QL total should increase from 6 to 7, with the extra contact under source not recorded.
2. Reject at `2026-10-08T15:00:00+03:00`. The historical total should return to 6.
3. Accept with the decision time blank, which defaults to now. The current contact should be QL, while the historical total remains 6.
4. Restart the application using the same database. Confirm all three decisions and report results persist.

Also test a blank message and an invalid identity: the UI should report validation errors without adding a partial record. A message instructing the system to ignore its rules must require human review. Supported Hebrew and Dutch patterns can be examined in the supplied seed; broader language support is deliberately limited.

## 4. Inspect visibility and generated content

Open **AI visibility**. The top gap is **alternatives to Laneframe for freight pricing**, scored **80/100**. Inspect original engine answers, owned citations, competitor mentions and wrong-brand warnings.

Generate a brief and verify its mode label, 40–60-word direct answer, 3–5 sections, 3–5 FAQs, source IDs on every factual claim and suggested schema.org type. The offline template is not presented as model inference.

To exercise the real model, follow the [README model setup](../README.md#local-llm-optional), then restart with `LLM_PROVIDER=ollama`. Use a new inbound or Reanalyze to invoke the model; existing seed analysis remains labelled rules. The independent local-model smoke check is:

```sh
npm run test:live
```

## 5. Final checks and delivery

```sh
npm run check
npx playwright install chromium
npm run test:e2e
npm run export:kpi
```

The export reflects the configured database. Decide deliberately whether the delivered report represents clean source data or documented review corrections; do not accidentally export experimental decisions.

The approved process account and time estimate are recorded in [PROCESS.md](../PROCESS.md). The public repository is the submission artifact; `npm run package` provides an optional archive with Git history. No email is sent by this command.

For the live code discussion, be ready to explain the two-agent boundary, identity matching, the five-condition gate, report cutoff, model failure behavior and constrained claims. Practice one small code change without AI assistance.

## 6. Code walkthrough

Trace one inbound request through `server/http/routes.ts`, `controllers/workspace-controller.ts`, `services/workspace-service.ts`, `services/ingestion-service.ts` and the extraction agent. Explain how the repository update commits an analysis and recomputes the report. Then inspect `domain/qualification.ts` to distinguish score from the five-condition gate.

In `server/composition.ts`, identify the injected model, prompts and repository. Explain how `LLM_PROVIDER`, `LLM_MODEL` and `LLM_ENDPOINT` select an existing adapter, and where a new protocol adapter would be registered. Ollama has live runtime validation; the compatible adapter has mocked protocol coverage.

In the client, follow `App.tsx` to a feature component, `hooks/useWorkspace.ts` and `api/workspace.ts`. Explain which state belongs to a feature and which belongs to workspace loading/mutations.
