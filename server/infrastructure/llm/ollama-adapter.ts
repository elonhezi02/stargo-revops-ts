import { localEndpoint } from "./endpoint.js";
import { type Generator, type ModelOptions } from "../../ports/model.js";
export function createOllamaGenerator(
  c: ModelOptions,
  transport: typeof fetch = fetch,
): Generator {
  const endpoint = localEndpoint(
    c.endpoint ?? "http://127.0.0.1:11434/api/chat",
  );
  return async (system, input, schema) => {
    try {
      const response = await transport(endpoint, {
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
      const data = (await response.json()) as {
        message?: { content?: string };
      };
      return JSON.parse(data.message?.content ?? "");
    } catch {
      throw new Error("Model unavailable or invalid response");
    }
  };
}
