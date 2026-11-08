import express from "express";
import { join } from "node:path";
import { existsSync } from "node:fs";
import type { WorkspaceService } from "../services/workspace-service.js";
import { WorkspaceController } from "./controllers/workspace-controller.js";
import { workspaceRoutes } from "./routes.js";
import { localOnly } from "./middleware/local-only.js";
import { errorHandler } from "./middleware/error-handler.js";
export function createHttpApp(service: WorkspaceService, dist: string) {
  const app = express();
  app.disable("x-powered-by");
  app.use(localOnly, express.json({ limit: "64kb" }));
  app.use("/api", workspaceRoutes(new WorkspaceController(service)));
  app.use("/api", (_req, res) =>
    res.status(404).json({ detail: "Endpoint not found" }),
  );
  if (existsSync(dist)) {
    app.use(express.static(dist));
    app.get("/", (_req, res) => res.sendFile(join(dist, "index.html")));
  }
  app.use(errorHandler);
  return app;
}
