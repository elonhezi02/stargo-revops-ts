import type { Generator, ModelOptions } from "../../ports/model.js";
import { localEndpoint } from "./endpoint.js";
/** Adapter for local servers implementing the Chat Completions JSON-schema protocol. */
export function createOpenAICompatibleGenerator(
  options: ModelOptions,
  transport: typeof fetch = fetch,
): Generator {
  const endpoint = localEndpoint(
    options.endpoint ?? "http://127.0.0.1:1234/v1/chat/completions",
  );
  return async (system, input, schema) => {
    try {
      const response = await transport(endpoint, {
        method: "POST",
        redirect: "error",
        signal: AbortSignal.timeout(options.timeout),
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: options.model,
          stream: false,
          temperature: 0,
          max_tokens: 2500,
          messages: [
            { role: "system", content: system },
            { role: "user", content: JSON.stringify(input) },
          ],
          response_format: {
            type: "json_schema",
            json_schema: { name: "agent_response", strict: true, schema },
          },
        }),
      });
      if (!response.ok) throw new Error();
      const data = (await response.json()) as {
        choices?: { message?: { content?: string } }[];
      };
      return JSON.parse(data.choices?.[0]?.message?.content ?? "");
    } catch {
      throw new Error("Model unavailable or invalid response");
    }
  };
}
