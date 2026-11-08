export const briefPrompt = {
  version: "1.0",
  system: `Plan content for the buyer question using only approved claim IDs and headings.
Use position, quote, control for the direct answer (50 words).
Choose distinct sections and FAQ questions.
Never invent claims or describe competitors.
Return the schema.`,
} as const;
