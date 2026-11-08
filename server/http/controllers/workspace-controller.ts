import type { RequestHandler } from "express";
import type { WorkspaceService } from "../../services/workspace-service.js";
export class WorkspaceController {
  constructor(private readonly service: WorkspaceService) {}
  health: RequestHandler = (_req, res) => {
    res.json(this.service.health());
  };
  workspace: RequestHandler = (_req, res) => {
    res.json(this.service.workspace());
  };
  addLead: RequestHandler = async (req, res) => {
    const id = await this.service.addLead({ ...req.body, id: undefined });
    res.status(201).json({ contact_id: id });
  };
  decide: RequestHandler = async (req, res) => {
    res
      .status(201)
      .json(await this.service.decide(String(req.params.id), req.body));
  };
  reanalyze: RequestHandler = async (req, res) => {
    await this.service.reanalyze(String(req.params.id));
    res.json({ contact_id: req.params.id });
  };
  brief: RequestHandler = async (_req, res) => {
    res.json(await this.service.brief());
  };
  export: RequestHandler = (_req, res) => {
    res
      .type("text/markdown")
      .attachment("KPI_PACK.md")
      .send(this.service.export());
  };
}
