export type Generator = (
  system: string,
  input: unknown,
  schema: Record<string, unknown>,
) => Promise<unknown>;
export const unavailableModel: Generator = async () => {
  throw new Error("Model provider was not configured");
};
export interface ModelOptions {
  model: string;
  timeout: number;
  endpoint?: string;
}
