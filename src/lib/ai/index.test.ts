import { afterEach, describe, expect, it, vi } from "vitest";
import { getAIProvider } from "./index";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("getAIProvider", () => {
  it("defaults to gemini", () => {
    vi.stubEnv("AI_PROVIDER", undefined);
    vi.stubEnv("AI_API_KEY", "key");
    vi.stubEnv("AI_MODEL", undefined);
    vi.stubEnv("LOVABLE_API_KEY", undefined);
    expect(getAIProvider()).toMatchObject({ name: "gemini", model: "gemini-flash-latest" });
  });

  it("matches the provider name case-insensitively and honours AI_MODEL", () => {
    vi.stubEnv("AI_PROVIDER", "GEMINI");
    vi.stubEnv("AI_API_KEY", "key");
    vi.stubEnv("AI_MODEL", "gemini-2.5-pro");
    vi.stubEnv("LOVABLE_API_KEY", undefined);
    expect(getAIProvider().model).toBe("gemini-2.5-pro");
  });

  it("throws when the API key is missing", () => {
    vi.stubEnv("AI_PROVIDER", "gemini");
    vi.stubEnv("AI_API_KEY", undefined);
    expect(() => getAIProvider()).toThrow("AI_API_KEY is not configured");
  });

  it("rejects unknown providers", () => {
    vi.stubEnv("AI_PROVIDER", "openai");
    vi.stubEnv("AI_API_KEY", "key");
    expect(() => getAIProvider()).toThrow("Unsupported AI_PROVIDER: openai");
  });
});
