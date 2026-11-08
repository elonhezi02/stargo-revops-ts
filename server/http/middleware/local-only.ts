import type { RequestHandler } from "express";
export const localOnly: RequestHandler = (req, res, next) => {
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
};
