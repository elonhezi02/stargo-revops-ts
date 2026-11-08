import { it, expect, afterEach, vi } from "vitest";
import request from "supertest";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createApp, type AppOptions } from "../server/composition.js";
import { Store } from "../server/infrastructure/db/sqlite-workspace-repository.js";
import { ConflictError } from "../server/ports/workspace-repository.js";
const cleanup: (() => void)[] = [];
afterEach(() => {
  cleanup
    .splice(0)
    .reverse()
    .forEach((f) => f());
  vi.unstubAllEnvs();
});
async function setup(options: AppOptions = {}) {
  vi.stubEnv("LLM_PROVIDER", "rules");
  const dir = mkdtempSync(join(tmpdir(), "revops-test-"));
  cleanup.push(() => rmSync(dir, { recursive: true, force: true }));
  const a = await createApp(join(dir, "db.sqlite"), options);
  cleanup.push(() => a.store.close());
  return { ...a, path: join(dir, "db.sqlite"), req: request(a.app) };
}
it("serves API and persists a replayed decision after restart", async () => {
  const a = await setup();
  expect((await a.req.get("/api/workspace")).body.pack.metrics[0].actual).toBe(
    6,
  );
  await a.req
    .post("/api/leads/HS-1001/decisions")
    .send({ decision: "rejected", decided_at: "2026-10-08T12:00:00+03:00" })
    .expect(201);
  const b = new Store(a.path);
  cleanup.push(() => b.close());
  await b.initialize();
  expect(b.read().pack!.metrics[0].actual).toBe(5);
  await a.req
    .post("/api/leads/HS-1001/decisions")
    .send({ decision: "accepted" })
    .expect(201);
  expect((await a.req.get("/api/workspace")).body.pack.metrics[0].actual).toBe(
    5,
  );
});
it("adds a lead, accepts it and recomputes source-not-recorded", async () => {
  const a = await setup();
  const r = await a.req
    .post("/api/leads")
    .send({
      from_name: "Fresh prospect",
      channel: "form_fill",
      body: "I own a 50-person customs brokerage in Haifa. We handle import declarations manually. Can we see a demo?",
      received_at: "2026-10-05T12:00:00+03:00",
    })
    .expect(201);
  await a.req
    .post(`/api/leads/${r.body.contact_id}/decisions`)
    .send({ decision: "accepted", decided_at: "2026-10-07T12:00:00+03:00" })
    .expect(201);
  const p = (await a.req.get("/api/workspace")).body.pack;
  expect(p.metrics[0].actual).toBe(7);
  expect(
    p.sources.find(
      (s: { source: string }) => s.source === "source not recorded",
    ).actual,
  ).toBe(1);
});
it("rejects invalid input without mutation or echoing private content", async () => {
  const a = await setup();
  const before = a.store.read().revision;
  const r = await a.req
    .post("/api/leads")
    .send({
      from_name: "private",
      from_email: "bad@bad",
      body: "",
      channel: "bad",
    })
    .expect(422);
  expect(r.text).not.toContain("private");
  expect(a.store.read().revision).toBe(before);
  await a.req
    .post("/api/leads/HS-1001/decisions")
    .send({ decision: "accepted", decided_at: "2026-10-07T12:00:00" })
    .expect(422);
  await a.req
    .post("/api/leads/HS-1001/decisions")
    .send({ decision: "accepted", decided_at: "2099-10-07T12:00:00Z" })
    .expect(422);
});
it("rejects foreign origins and unknown leads", async () => {
  const a = await setup();
  await a.req
    .post("/api/visibility/brief")
    .set("Origin", "https://outside.test")
    .send({})
    .expect(403);
  await a.req
    .post("/api/leads/missing/decisions")
    .send({ decision: "accepted" })
    .expect(404);
  expect((await a.req.get("/api/health")).body.outbound_enabled).toBe(false);
});
it("serializes concurrent writes and rejects cross-process lost updates", async () => {
  const a = await setup();
  await Promise.all([
    a.store.update((s) => s.rejected.push({ id: "one", reason: "test" })),
    a.store.update((s) => s.rejected.push({ id: "two", reason: "test" })),
  ]);
  expect(a.store.read().rejected.map((x) => x.id)).toContain("two");
  const b = new Store(a.path);
  cleanup.push(() => b.close());
  await expect(
    a.store.update(async (s) => {
      await b.update((t) => t.revision);
      s.rejected.push({ id: "lost", reason: "test" });
    }),
  ).rejects.toBeInstanceOf(ConflictError);
  expect(a.store.read().rejected.some((x) => x.id === "lost")).toBe(false);
});
it("model failure creates needs-review without changing historical count", async () => {
  const a = await setup({
    settings: {
      port: 3002,
      database: ":memory:",
      provider: "ollama",
      model: "test",
      timeout: 1000,
    },
    generate: async () => {
      throw new Error("private prompt");
    },
  });
  await a.req.post("/api/leads/HS-1001/reanalyze").send({}).expect(200);
  const data = (await a.req.get("/api/workspace")).body;
  expect(
    data.leads.find((l: { id: string }) => l.id === "HS-1001").status,
  ).toBe("needs review");
  expect(data.pack.metrics[0].actual).toBe(6);
  expect(JSON.stringify(data)).not.toContain("private prompt");
});

it("isolates providers and injects prompts and clock without mutating global configuration", async () => {
  const { rules } = await import("../server/agents/extraction-agent.js");
  const calls: string[] = [];
  const live = await setup({
    settings: {
      port: 3002,
      database: ":memory:",
      provider: "ollama",
      model: "injected-model",
      timeout: 1000,
    },
    prompts: {
      extraction: "custom extraction prompt",
      brief: "custom brief prompt",
    },
    generate: async (prompt, input) => {
      calls.push(prompt);
      return rules((input as { message: string }).message);
    },
    services: { now: () => new Date("2026-11-06T09:00:00Z") },
  });
  const offline = await setup();
  vi.stubEnv("LLM_PROVIDER", "invalid-after-start");
  expect((await live.req.get("/api/health")).body.provider).toBe("ollama");
  expect((await offline.req.get("/api/health")).body.provider).toBe("rules");
  const result = await live.req
    .post("/api/leads")
    .send({
      from_name: "DI prospect",
      channel: "form_fill",
      body: "I own a 45-person customs brokerage in Haifa. We handle import declarations manually. Can we see a demo?",
    })
    .expect(201);
  expect(calls).toEqual(["custom extraction prompt"]);
  const lead = live.store.read().analyses.at(-1)!;
  expect(lead.mode).toBe("ollama");
  expect(lead.error).toBeNull();
  const decision = await live.req
    .post(`/api/leads/${result.body.contact_id}/decisions`)
    .send({ decision: "accepted" })
    .expect(201);
  expect(decision.body.recorded_at).toBe("2026-11-06T09:00:00.000Z");
});
