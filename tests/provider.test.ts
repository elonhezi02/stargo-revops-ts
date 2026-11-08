import { it, expect } from "vitest";
import { createOpenAICompatibleGenerator } from "../server/infrastructure/llm/openai-compatible-adapter.js";
import { createModel } from "../server/infrastructure/llm/provider-factory.js";
import { localEndpoint } from "../server/infrastructure/llm/endpoint.js";

it("adapts a local Chat Completions response and requests constrained JSON", async () => {
  const generate = createOpenAICompatibleGenerator(
    { model: "local-test", timeout: 1000 },
    async (url, options) => {
      expect(url).toBe("http://127.0.0.1:1234/v1/chat/completions");
      expect(options?.redirect).toBe("error");
      const body = JSON.parse(String(options?.body));
      expect(body.model).toBe("local-test");
      expect(body.response_format.json_schema.schema).toEqual({
        type: "object",
      });
      return Response.json({
        choices: [{ message: { content: '{"ok":true}' } }],
      });
    },
  );
  expect(
    await generate("system", { message: "test" }, { type: "object" }),
  ).toEqual({ ok: true });
});
it.each(["network", "http", "invalid-json", "empty"])(
  "sanitizes compatible provider failure: %s",
  async (kind) => {
    const generate = createOpenAICompatibleGenerator(
      { model: "local-test", timeout: 1000 },
      async () => {
        if (kind === "network") throw new Error("private payload");
        if (kind === "http")
          return new Response("private payload", { status: 500 });
        return Response.json(
          kind === "empty"
            ? {}
            : { choices: [{ message: { content: "private payload" } }] },
        );
      },
    );
    await expect(generate("system", {}, {})).rejects.toThrow(
      "Model unavailable or invalid response",
    );
  },
);
it.each([
  "https://outside.example/api",
  "file:///tmp/model",
  "http://user:pass@localhost/api",
  "http://localhost/api?secret=1",
])("rejects unsafe endpoint configuration: %s", (endpoint) => {
  expect(() => localEndpoint(endpoint)).toThrow();
});
it("selects configured providers and rejects unknown names", async () => {
  for (const provider of ["ollama", "openai-compatible"])
    expect(typeof createModel({ provider, model: "test", timeout: 1000 })).toBe(
      "function",
    );
  await expect(
    createModel({ provider: "rules", model: "test", timeout: 1000 })(
      "",
      {},
      {},
    ),
  ).rejects.toThrow("not configured");
  expect(() =>
    createModel({ provider: "unknown", model: "test", timeout: 1000 }),
  ).toThrow("Unsupported model provider");
});
