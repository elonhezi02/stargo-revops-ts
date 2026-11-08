import { spawnSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import { resolve } from "node:path";
import "dotenv/config";
const command = process.argv[2];
if (!["serve", "pull"].includes(command)) throw new Error("Use serve or pull");
const model =
  process.env.LLM_MODEL ?? process.env.OLLAMA_MODEL ?? "qwen3:4b-instruct";
const models = resolve("runtime/models");
mkdirSync(models, { recursive: true });
const result = spawnSync(
  process.env.OLLAMA_BIN ?? "ollama",
  command === "serve" ? ["serve"] : ["pull", model],
  {
    stdio: "inherit",
    env: {
      ...process.env,
      OLLAMA_HOST: "127.0.0.1:11434",
      OLLAMA_MODELS: models,
      OLLAMA_NO_CLOUD: "1",
    },
  },
);
if (result.error)
  console.error(
    "Ollama CLI unavailable. Install Ollama, or set OLLAMA_BIN to its executable.",
  );
process.exit(result.status ?? 1);
