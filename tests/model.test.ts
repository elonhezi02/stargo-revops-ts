import { it, expect, vi, afterEach } from "vitest";
import { generate } from "../server/model.js";
afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});
it.each(["network", "401", "garbage", "timeout"])(
  "bounds and sanitizes model failure: %s",
  async (kind) => {
    vi.stubEnv("LLM_PROVIDER", "ollama");
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url, options) => {
        expect(url).toBe("http://127.0.0.1:11434/api/chat");
        expect(options.redirect).toBe("error");
        expect(options.signal).toBeDefined();
        if (kind === "network" || kind === "timeout") throw new Error("secret");
        return kind === "401"
          ? new Response("secret", { status: 401 })
          : Response.json({ message: { content: "not-json" } });
      }),
    );
    await expect(
      generate("system", { message: "private" }, {}),
    ).rejects.toThrow("Model unavailable or invalid response");
  },
);
it("returns structured JSON using schema constraint and no thinking", async () => {
  vi.stubEnv("LLM_PROVIDER", "ollama");
  vi.stubGlobal(
    "fetch",
    vi.fn(async (_url, options) => {
      const body = JSON.parse(options.body);
      expect(body.think).toBe(false);
      expect(body.format).toEqual({ type: "object" });
      return Response.json({ message: { content: '{"ok":true}' } });
    }),
  );
  expect(await generate("extract", {}, { type: "object" })).toEqual({
    ok: true,
  });
});
