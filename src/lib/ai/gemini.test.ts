import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createGeminiProvider } from "./gemini";

type FetchResponse = { ok?: boolean; status?: number; json?: unknown; text?: string };

type RequestInitStub = { headers: Record<string, string>; body: string };

function queueFetch(...responses: FetchResponse[]) {
  let call = 0;
  const fetchMock = vi.fn(async (_url: string, _init: RequestInitStub) => {
    const r = responses[Math.min(call++, responses.length - 1)];
    return {
      ok: r.ok ?? true,
      status: r.status ?? 200,
      json: async () => r.json ?? {},
      text: async () => r.text ?? "",
    };
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

function googleReply(text: string): FetchResponse {
  return { json: { candidates: [{ content: { parts: [{ text }] } }] } };
}

function gatewayReply(content: string): FetchResponse {
  return { json: { choices: [{ message: { content } }] } };
}

const input = {
  cvText: "10 years of React",
  jobDescription: "React role",
  jobTitle: "FE",
  company: "Acme",
};

function requestBody(fetchMock: ReturnType<typeof queueFetch>, call = 0) {
  return JSON.parse(fetchMock.mock.calls[call][1].body);
}

beforeEach(() => {
  vi.stubEnv("LOVABLE_API_KEY", undefined);
  vi.stubEnv("AI_MODEL", undefined);
  vi.spyOn(console, "warn").mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("provider identity", () => {
  it("calls Google directly when no gateway key is set", () => {
    const provider = createGeminiProvider("key");
    expect(provider).toMatchObject({ name: "gemini", model: "gemini-flash-latest" });
  });

  it("strips the vendor prefix from AI_MODEL for the direct Google API", () => {
    vi.stubEnv("AI_MODEL", "google/gemini-2.5-pro");
    expect(createGeminiProvider("key").model).toBe("gemini-2.5-pro");
  });

  it("uses the Lovable gateway when LOVABLE_API_KEY is set", () => {
    vi.stubEnv("LOVABLE_API_KEY", "gw");
    expect(createGeminiProvider("key", "gemini-2.5-flash")).toMatchObject({
      name: "lovable-ai",
      model: "google/gemini-2.5-flash",
    });
  });
});

describe("analyzeMatch", () => {
  it("clamps the score and caps the bullet lists", async () => {
    queueFetch(
      googleReply(
        JSON.stringify({
          matchScore: 250,
          strengths: ["a", "b", "c", "d", "e", "f"],
          weaknesses: ["x"],
        }),
      ),
    );
    await expect(createGeminiProvider("key").analyzeMatch(input)).resolves.toEqual({
      matchScore: 100,
      strengths: ["a", "b", "c", "d", "e"],
      weaknesses: ["x"],
      gaps: [
        {
          issue: "x",
          severity: "important",
          recommendation: "Address or highlight relevant experience for this requirement.",
        },
      ],
    });
  });

  it("defaults a missing or malformed payload to zero", async () => {
    queueFetch(googleReply(JSON.stringify({ strengths: "not-an-array" })));
    await expect(createGeminiProvider("key").analyzeMatch(input)).resolves.toEqual({
      matchScore: 0,
      strengths: [],
      weaknesses: [],
      gaps: [],
    });
  });

  it("unwraps JSON fenced in a markdown code block", async () => {
    queueFetch(googleReply('```json\n{"matchScore": 42}\n```'));
    const result = await createGeminiProvider("key").analyzeMatch(input);
    expect(result.matchScore).toBe(42);
  });

  it("throws a readable error on non-JSON output", async () => {
    queueFetch(googleReply("sorry, I can't do that"));
    await expect(createGeminiProvider("key").analyzeMatch(input)).rejects.toThrow(
      /AI returned invalid JSON/,
    );
  });

  it("requests JSON output from Google", async () => {
    const fetchMock = queueFetch(googleReply("{}"));
    await createGeminiProvider("key").analyzeMatch(input);
    expect(requestBody(fetchMock).generationConfig).toMatchObject({
      responseMimeType: "application/json",
      maxOutputTokens: 512,
      temperature: 0,
    });
  });
});

describe("extractKeywords", () => {
  it("caps each keyword list at 12 entries", async () => {
    const many = Array.from({ length: 20 }, (_, i) => `k${i}`);
    queueFetch(googleReply(JSON.stringify({ matchedKeywords: many, missingKeywords: many })));
    const result = await createGeminiProvider("key").extractKeywords(input);
    expect(result.matchedKeywords).toHaveLength(12);
    expect(result.missingKeywords).toHaveLength(12);
  });

  it("tolerates a payload with no keyword arrays", async () => {
    queueFetch(googleReply("{}"));
    await expect(createGeminiProvider("key").extractKeywords(input)).resolves.toEqual({
      matchedKeywords: [],
      missingKeywords: [],
      suggestedRewrites: [],
    });
  });
});

describe("generateCoverLetter", () => {
  it.each([
    ["formal", "Professional, respectful tone."],
    ["warm", "Warm, genuine, enthusiastic tone."],
    ["confident", "Confident, impactful, ownership-focused tone."],
  ] as const)("injects the %s tone instruction", async (tone, expected) => {
    const fetchMock = queueFetch(googleReply("Dear hiring manager"));
    await createGeminiProvider("key").generateCoverLetter(input, tone);
    expect(requestBody(fetchMock).systemInstruction.parts[0].text).toContain(expected);
  });

  it("omits the tone instruction when no tone is given", async () => {
    const fetchMock = queueFetch(googleReply("Dear hiring manager"));
    await expect(createGeminiProvider("key").generateCoverLetter(input)).resolves.toBe(
      "Dear hiring manager",
    );
    const body = requestBody(fetchMock);
    expect(body.systemInstruction.parts[0].text).not.toContain("tone.");
    expect(body.generationConfig.responseMimeType).toBeUndefined();
  });

  it("leaves a CV shorter than 10,000 characters untouched", async () => {
    const fetchMock = queueFetch(googleReply("letter"));
    const cvText = "z".repeat(3500);
    await createGeminiProvider("key").generateCoverLetter({ cvText, jobDescription: "JD" });
    const user = requestBody(fetchMock).contents[0].parts[0].text as string;
    expect(user).toContain(`CANDIDATE CV:\n${cvText}`);
    expect(user).not.toContain("[... CV truncated for performance ...]");
  });

  it("truncates beyond 10,000 characters at a nearby newline and keeps the notice", async () => {
    const fetchMock = queueFetch(googleReply("letter"));
    const retained = "z".repeat(9800);
    await createGeminiProvider("key").generateCoverLetter({
      cvText: `${retained}\n${"x".repeat(500)}`,
      jobDescription: "JD",
    });
    const user = requestBody(fetchMock).contents[0].parts[0].text as string;
    expect(user).toContain(`CANDIDATE CV:\n${retained}\n[... CV truncated for performance ...]`);
    expect(user).not.toContain("x");
    expect(user).toContain("[... CV truncated for performance ...]");
    expect(user).toContain("JOB TITLE: (unspecified)");
    expect(user).toContain("COMPANY: (unspecified)");
  });
});

describe("Google transport", () => {
  it("retries once on 404 with the fallback model", async () => {
    vi.stubEnv("AI_MODEL", "gemini-2.5-flash");
    const fetchMock = queueFetch({ ok: false, status: 404, text: "gone" }, googleReply("letter"));
    await expect(createGeminiProvider("key").generateCoverLetter(input)).resolves.toBe("letter");
    expect(fetchMock.mock.calls[0][0]).toContain("gemini-2.5-flash:generateContent");
    expect(fetchMock.mock.calls[1][0]).toContain("gemini-flash-latest:generateContent");
  });

  it("reports a 404 on the fallback model instead of retrying forever", async () => {
    const fetchMock = queueFetch({ ok: false, status: 404, text: "gone" });
    await expect(createGeminiProvider("key").generateCoverLetter(input)).rejects.toThrow(
      /Remove AI_MODEL or set it to "gemini-flash-latest"/,
    );
    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it.each([
    [429, /rate limit reached/],
    [401, /AI key rejected by Google/],
    [403, /AI key rejected by Google/],
    [500, /AI error 500: boom/],
  ])("maps HTTP %s to a helpful message", async (status, expected) => {
    queueFetch({ ok: false, status, text: "boom" });
    await expect(createGeminiProvider("key").generateCoverLetter(input)).rejects.toThrow(expected);
  });

  it("rejects an empty completion", async () => {
    queueFetch(googleReply(""));
    await expect(createGeminiProvider("key").generateCoverLetter(input)).rejects.toThrow(
      "AI returned empty response. Try again.",
    );
  });

  it("sends the API key as a Google header", async () => {
    const fetchMock = queueFetch(googleReply("letter"));
    await createGeminiProvider("key").generateCoverLetter(input);
    expect(fetchMock.mock.calls[0][1].headers["x-goog-api-key"]).toBe("key");
  });
});

describe("Lovable gateway transport", () => {
  beforeEach(() => {
    vi.stubEnv("LOVABLE_API_KEY", "gw-key");
  });

  it("posts an OpenAI-shaped request to the gateway", async () => {
    const fetchMock = queueFetch(gatewayReply("letter"));
    await expect(createGeminiProvider("key").generateCoverLetter(input)).resolves.toBe("letter");
    expect(fetchMock.mock.calls[0][0]).toBe("https://ai.gateway.lovable.dev/v1/chat/completions");
    expect(fetchMock.mock.calls[0][1].headers["Lovable-API-Key"]).toBe("gw-key");
    expect(requestBody(fetchMock)).toMatchObject({
      model: "google/gemini-2.5-flash",
      max_tokens: 1280,
    });
  });

  it("asks for a JSON object on structured calls", async () => {
    const fetchMock = queueFetch(gatewayReply("{}"));
    await createGeminiProvider("key").extractKeywords(input);
    expect(requestBody(fetchMock).response_format).toEqual({ type: "json_object" });
  });

  it("uses deterministic-focused temperature for match analysis through the gateway", async () => {
    const fetchMock = queueFetch(gatewayReply("{}"));
    await createGeminiProvider("key").analyzeMatch(input);
    expect(requestBody(fetchMock).temperature).toBe(0);
  });

  it.each([
    [429, /rate limit reached/],
    [402, /AI credits exhausted/],
    [500, /AI error 500: boom/],
  ])("maps gateway HTTP %s to a helpful message", async (status, expected) => {
    queueFetch({ ok: false, status, text: "boom" });
    await expect(createGeminiProvider("key").generateCoverLetter(input)).rejects.toThrow(expected);
  });

  it("rejects an empty gateway completion", async () => {
    queueFetch(gatewayReply(""));
    await expect(createGeminiProvider("key").generateCoverLetter(input)).rejects.toThrow(
      "AI returned empty response. Try again.",
    );
  });
});
