import { it, expect } from "vitest";
import { createOllamaGenerator } from "../server/infrastructure/llm/ollama-adapter.js";
it.each(["network", "401", "garbage", "timeout"])(
  "bounds and sanitizes model failure: %s",
  async (kind) => {
    const transport: typeof fetch = async (url, options) => {
      expect(url).toBe("http://127.0.0.1:11434/api/chat");
      expect(options?.redirect).toBe("error");
      expect(options?.signal).toBeDefined();
      if (kind === "network" || kind === "timeout") throw new Error("secret");
      return kind === "401"
        ? new Response("secret", { status: 401 })
        : Response.json({ message: { content: "not-json" } });
    };
    const generate = createOllamaGenerator(
      { model: "test-model", timeout: 1000 },
      transport,
    );
    await expect(
      generate("system", { message: "private" }, {}),
    ).rejects.toThrow("Model unavailable or invalid response");
  },
);
it("returns structured JSON using the injected model and schema constraint", async () => {
  const transport: typeof fetch = async (_url, options) => {
    const body = JSON.parse(String(options?.body));
    expect(body.model).toBe("injected-model");
    expect(body.think).toBe(false);
    expect(body.format).toEqual({ type: "object" });
    return Response.json({ message: { content: '{"ok":true}' } });
  };
  const generate = createOllamaGenerator(
    { model: "injected-model", timeout: 1000 },
    transport,
  );
  expect(await generate("extract", {}, { type: "object" })).toEqual({
    ok: true,
  });
});

it("uses a configurable local Ollama endpoint", async () => {
  const generate = createOllamaGenerator(
    {
      model: "another-model",
      timeout: 1000,
      endpoint: "http://localhost:11435/api/chat",
    },
    async (url) => {
      expect(url).toBe("http://localhost:11435/api/chat");
      return Response.json({ message: { content: '{"ok":true}' } });
    },
  );
  expect(await generate("extract", {}, {})).toEqual({ ok: true });
});
