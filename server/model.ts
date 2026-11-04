import { config } from "./config.js";
export type Generator = (
  system: string,
  input: unknown,
  schema: Record<string, unknown>,
) => Promise<unknown>;
export const generate: Generator = async (system, input, schema) => {
  const c = config();
  if (c.provider !== "ollama") throw new Error("Unsupported model provider");
  try {
    const response = await fetch("http://127.0.0.1:11434/api/chat", {
      method: "POST",
      redirect: "error",
      signal: AbortSignal.timeout(c.timeout),
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: c.model,
        stream: false,
        think: false,
        format: schema,
        options: { temperature: 0, num_ctx: 8192, num_predict: 2500 },
        messages: [
          {
            role: "system",
            content:
              system +
              "\nReturn JSON matching this schema: " +
              JSON.stringify(schema),
          },
          { role: "user", content: JSON.stringify(input) },
        ],
      }),
    });
    if (!response.ok) throw new Error();
    const data = (await response.json()) as { message?: { content?: string } };
    return JSON.parse(data.message?.content ?? "");
  } catch {
    throw new Error("Model unavailable or invalid response");
  }
};
