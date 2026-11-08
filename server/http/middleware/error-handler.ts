import type express from "express";
import { ZodError } from "zod";
import { ConflictError } from "../../ports/workspace-repository.js";
export const errorHandler = (
  err: unknown,
  _req: express.Request,
  res: express.Response,
  _next: express.NextFunction,
) => {
  const e = err as { status?: number };
  if (err instanceof ZodError)
    return res.status(422).json({
      detail:
        "Invalid fields: " + err.issues.map((i) => i.path.join(".")).join(", "),
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
};
