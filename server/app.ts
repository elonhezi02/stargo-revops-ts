import express from "express";
import { join } from "node:path";
import { existsSync } from "node:fs";
import { ZodError } from "zod";
import { DecisionSchema, type Workspace } from "../shared/contracts.js";
import { config, ROOT } from "./config.js";
import { Store, ingest, uid, ConflictError } from "./storage.js";
import { qualify, parts, instant } from "./qualification.js";
import { extract } from "./extraction.js";
import { visibility, contentBrief } from "./visibility.js";
import { markdown } from "./reporting.js";
import type { Generator } from "./model.js";
export async function createApp(path = config().database, call?: Generator) {
  const store = new Store(path);
  await store.initialize();
  const app = express();
  app.disable("x-powered-by");
  app.use((req, res, next) => {
    res.set({
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "no-referrer",
      "Cache-Control": "no-store",
    });
    if (!["127.0.0.1", "localhost", "[::1]"].includes(req.hostname))
      return res.status(400).json({ detail: "Local host required" });
    const origin = req.get("origin");
    if (origin && !["GET", "HEAD", "OPTIONS"].includes(req.method)) {
      try {
        if (!["127.0.0.1", "localhost"].includes(new URL(origin).hostname))
          return res.status(403).json({ detail: "Local origin required" });
      } catch {
        return res.status(403).json({ detail: "Invalid origin" });
      }
    }
    next();
  });
  app.use(express.json({ limit: "64kb" }));
  app.get("/api/health", (_req, res) =>
    res.json({
      status: "ok",
      provider: config().provider,
      model: config().model,
      outbound_enabled: false,
    }),
  );
  app.get("/api/workspace", (_req, res) => {
    const s = store.read();
    const data: Workspace = {
      revision: s.revision,
      provider: config().provider,
      model: config().model,
      leads: s.contacts
        .map((c) => ({
          ...c,
          name: `${c.first_name} ${c.last_name}`.trim(),
          ...parts(s, c.id),
          ...qualify(s, c),
        }))
        .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name)),
      pack: s.pack!,
      gaps: visibility(),
      brief: s.brief,
      rejected: s.rejected,
    };
    res.json(data);
  });
  app.post("/api/leads", async (req, res) => {
    const id = await store.update((s) =>
      ingest(s, { ...req.body, id: undefined }, config().provider, call),
    );
    res.status(201).json({ contact_id: id });
  });
  const mustContact = (s: ReturnType<Store["read"]>, id: string) => {
    const c = s.contacts.find((c) => c.id === id);
    if (!c) throw Object.assign(new Error("Lead not found"), { status: 404 });
    return c;
  };
  app.post("/api/leads/:id/decisions", async (req, res) => {
    const input = DecisionSchema.parse(req.body);
    const row = await store.update((s) => {
      mustContact(s, req.params.id);
      const row = {
        ...input,
        id: uid("SD"),
        contact_id: req.params.id,
        sequence: s.decisions.length,
        recorded_at: new Date().toISOString(),
      };
      s.decisions.push(row);
      return row;
    });
    res.status(201).json(row);
  });
  app.post("/api/leads/:id/reanalyze", async (req, res) => {
    await store.update(async (s) => {
      const c = mustContact(s, req.params.id);
      for (const m of s.messages.filter((m) => m.contact_id === c.id)) {
        const result = await extract(m.body, c, config().provider, call);
        s.analyses.push({
          ...result,
          id: uid("A"),
          contact_id: c.id,
          message_id: m.id,
          received_at: m.received_at,
          effective_at: new Date().toISOString(),
        });
      }
    });
    res.json({ contact_id: req.params.id });
  });
  app.post("/api/visibility/brief", async (_req, res) =>
    res.json(
      await store.update(
        async (s) =>
          (s.brief = await contentBrief(
            visibility()[0],
            config().provider,
            call,
          )),
      ),
    ),
  );
  app.get("/api/kpi/export", (_req, res) =>
    res
      .type("text/markdown")
      .attachment("KPI_PACK.md")
      .send(markdown(store.read().pack!, visibility()[0])),
  );
  app.use("/api", (_req, res) =>
    res.status(404).json({ detail: "Endpoint not found" }),
  );
  const dist = join(ROOT, "dist");
  if (existsSync(dist)) {
    app.use(express.static(dist));
    app.get("/", (_req, res) => res.sendFile(join(dist, "index.html")));
  }
  app.use(
    (
      err: unknown,
      _req: express.Request,
      res: express.Response,
      _next: express.NextFunction,
    ) => {
      const e = err as { status?: number };
      if (err instanceof ZodError)
        return res.status(422).json({
          detail:
            "Invalid fields: " +
            err.issues.map((i) => i.path.join(".")).join(", "),
        });
      if (err instanceof ConflictError)
        return res.status(409).json({ detail: err.message });
      if (e.status === 404)
        return res.status(404).json({ detail: "Lead not found" });
      if (e.status === 413)
        return res.status(413).json({ detail: "Request too large" });
      if (e.status === 400)
        return res.status(400).json({ detail: "Invalid JSON request" });
      if (err instanceof Error && /identifier|LinkedIn/i.test(err.message))
        return res
          .status(422)
          .json({ detail: "Invalid or conflicting person identifiers" });
      res.status(500).json({
        detail: "Request failed. No automatic qualification was applied.",
      });
    },
  );
  return { app, store };
}
