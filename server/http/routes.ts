import { Router } from "express";
import type { WorkspaceController } from "./controllers/workspace-controller.js";
export function workspaceRoutes(controller: WorkspaceController) {
  const router = Router();
  router.get("/health", controller.health);
  router.get("/workspace", controller.workspace);
  router.post("/leads", controller.addLead);
  router.post("/leads/:id/decisions", controller.decide);
  router.post("/leads/:id/reanalyze", controller.reanalyze);
  router.post("/visibility/brief", controller.brief);
  router.get("/kpi/export", controller.export);
  return router;
}
