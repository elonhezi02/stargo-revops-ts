import { readFileSync } from "node:fs";
import { join } from "node:path";
import { DATA } from "../../config/environment.js";
import type { Capture, Gap } from "../../../shared/contracts.js";
export function visibility(): Gap[] {
  const data = JSON.parse(
    readFileSync(join(DATA, "ai_answers.json"), "utf8"),
  ) as {
    meta: { own_domains: string[]; known_competitors: string[] };
    answers: Omit<
      Capture,
      "mentioned" | "owned_citation" | "competitors" | "warnings"
    >[];
  };
  const groups = new Map<string, Gap>();
  for (const a of data.answers) {
    const wrong =
      /Stargo (?:is|operates|provides).{0,45}(?:carrier|travel|transportation|tour|shipping company)|travel booking|holiday booking|holidays|holiday packages/i.test(
        a.answer_text,
      );
    const warnings: string[] = [];
    if (wrong) warnings.push("Wrong or ambiguous identity (BC-5).");
    const hosts = a.citations.map((v) => {
      try {
        return new URL(v).hostname.toLowerCase();
      } catch {
        return "";
      }
    });
    if (
      hosts.some(
        (h) =>
          h.includes("stargo") &&
          !data.meta.own_domains.some((d) => h === d || h.endsWith("." + d)),
      )
    )
      warnings.push("Look-alike citation domain.");
    if (/public reviews|publishes use cases/i.test(a.answer_text))
      warnings.push("Claim not supported by approved brand context.");
    const row: Capture = {
      ...a,
      mentioned: /\bstargo\b/i.test(a.answer_text) && !wrong,
      owned_citation: hosts.some((h) =>
        data.meta.own_domains.some((d) => h === d || h.endsWith("." + d)),
      ),
      competitors: data.meta.known_competitors.filter((name) =>
        a.answer_text.toLowerCase().includes(name.toLowerCase()),
      ),
      warnings,
    };
    const gap = groups.get(a.prompt_id) ?? {
      id: a.prompt_id,
      question: a.prompt,
      priority: a.priority,
      score: 0,
      answers: [],
    };
    gap.answers.push(row);
    groups.set(a.prompt_id, gap);
  }
  return [...groups.values()]
    .map((g) => ({
      ...g,
      score:
        Math.round(
          (((1000 * g.priority) / 3) *
            g.answers.reduce(
              (n, a) =>
                n +
                0.4 * Number(!a.mentioned) +
                0.3 * Number(!a.owned_citation) +
                0.2 * Number(a.warnings.length > 0) +
                0.1 * Number(a.competitors.length > 0),
              0,
            )) /
            g.answers.length,
        ) / 10,
    }))
    .sort((a, b) => b.score - a.score || a.id.localeCompare(b.id));
}
