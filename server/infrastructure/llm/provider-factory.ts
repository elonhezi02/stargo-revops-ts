import {
  unavailableModel,
  type Generator,
  type ModelOptions,
} from "../../ports/model.js";
import { createOllamaGenerator } from "./ollama-adapter.js";
import { createOpenAICompatibleGenerator } from "./openai-compatible-adapter.js";
const providers: Record<string, (options: ModelOptions) => Generator> = {
  rules: () => unavailableModel,
  ollama: createOllamaGenerator,
  "openai-compatible": createOpenAICompatibleGenerator,
};
export function createModel(
  options: ModelOptions & { provider: string },
): Generator {
  const factory = Object.hasOwn(providers, options.provider)
    ? providers[options.provider]
    : undefined;
  if (!factory) throw new Error("Unsupported model provider");
  return factory(options);
}
