import "dotenv/config";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
export const ROOT = fileURLToPath(new URL("../../", import.meta.url));
export const DATA = resolve(
  ROOT,
  "source/Stargo_RevOps_Take_Home_Pack_v2/data",
);
export interface AppConfig {
  port: number;
  database: string;
  provider: string;
  model: string;
  timeout: number;
  endpoint?: string;
}
export const config = (): AppConfig => ({
  port: Number(process.env.PORT ?? 3002),
  database: resolve(ROOT, process.env.DATABASE_PATH ?? "runtime/revops.sqlite"),
  provider: process.env.LLM_PROVIDER ?? "rules",
  endpoint: process.env.LLM_ENDPOINT || undefined,
  model:
    process.env.LLM_MODEL ?? process.env.OLLAMA_MODEL ?? "qwen3:4b-instruct",
  timeout: Math.min(
    60000,
    Math.max(100, Number(process.env.LLM_TIMEOUT_MS) || 30000),
  ),
});
