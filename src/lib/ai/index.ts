import type { AIProvider } from "./types";
import { createGeminiProvider } from "./gemini";
import { createGroqProvider } from "./groq";

export type {
  AIProvider,
  TailorInput,
  MatchAnalysis,
  KeywordAnalysis,
} from "./types";

/**
 * Returns an AI provider based on env vars.
 *   AI_PROVIDER=gemini (default)
 *   AI_API_KEY=<key>
 *   AI_MODEL=<optional override>
 */
export function getAIProvider(): AIProvider {
  const provider = (process.env.AI_PROVIDER ?? "gemini").toLowerCase();
  const apiKey = process.env.AI_API_KEY;
  if (!apiKey) throw new Error("AI_API_KEY is not configured");

  switch (provider) {
    case "gemini":
      return createGeminiProvider(apiKey, process.env.AI_MODEL || undefined);
    case "groq":
      return createGroqProvider(apiKey, process.env.AI_MODEL || undefined);
    default:
      throw new Error(`Unsupported AI_PROVIDER: ${provider}`);
  }
}
