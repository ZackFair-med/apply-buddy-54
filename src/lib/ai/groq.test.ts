import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createGroqProvider } from "./groq";

type FetchResponse = { ok?: boolean; status?: number; json?: unknown; text?: string };

type RequestInitStub = { headers: Record<string, string>; body: string };

function mockFetch(response: FetchResponse) {
  const fetchMock = vi.fn(async (_url: string, _init: RequestInitStub) => ({
    ok: response.ok ?? true,
    status: response.status ?? 200,
    json: async () => response.json ?? {},
    text: async () => response.text ?? "",
  }));
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

function reply(content: string): FetchResponse {
  return { json: { choices: [{ message: { content } }] } };
}

function requestBody(fetchMock: ReturnType<typeof mockFetch>) {
  return JSON.parse(fetchMock.mock.calls[0][1].body);
}

const input = {
  cvText: "Rust and Go",
  jobDescription: "Backend role",
  jobTitle: "BE",
  company: "Acme",
};

beforeEach(() => {
  vi.spyOn(console, "error").mockImplementation(() => {});
  vi.spyOn(console, "warn").mockImplementation(() => {});
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("createGroqProvider", () => {
  it("preserves exact namespaced Groq model ids", () => {
    expect(createGroqProvider("key")).toMatchObject({
      name: "groq",
      model: "openai/gpt-oss-120b",
    });
    expect(createGroqProvider("key", "qwen/qwen3.6-27b").model).toBe("qwen/qwen3.6-27b");
  });

  it("authenticates with a bearer token", async () => {
    const fetchMock = mockFetch(reply("letter"));
    await createGroqProvider("key").generateCoverLetter(input);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://api.groq.com/openai/v1/chat/completions");
    expect(init.headers.authorization).toBe("Bearer key");
  });
});

describe("analyzeMatch", () => {
  it("clamps the score, caps bullets and requests strict structured JSON", async () => {
    const fetchMock = mockFetch(
      reply(JSON.stringify({ matchScore: -5, strengths: ["a", "b", "c", "d", "e", "f"] })),
    );
    await expect(createGroqProvider("key").analyzeMatch(input)).resolves.toEqual({
      matchScore: 0,
      strengths: ["a", "b", "c", "d", "e"],
      weaknesses: [],
      gaps: [],
    });
    expect(requestBody(fetchMock).response_format).toMatchObject({
      type: "json_schema",
      json_schema: { name: "match_analysis", strict: true },
    });
    expect(requestBody(fetchMock)).toMatchObject({
      max_completion_tokens: 1536,
      reasoning_effort: "low",
      reasoning_format: "hidden",
      temperature: 0,
    });
    expect(requestBody(fetchMock)).not.toHaveProperty("max_tokens");
  });

  it("unwraps fenced JSON", async () => {
    mockFetch(reply('```json\n{"matchScore": 77}\n```'));
    await expect(createGroqProvider("key").analyzeMatch(input)).resolves.toMatchObject({
      matchScore: 77,
    });
  });

  it("throws a readable error on non-JSON output", async () => {
    mockFetch(reply("nope"));
    await expect(createGroqProvider("key").analyzeMatch(input)).rejects.toThrow(
      /Groq returned invalid JSON/,
    );
  });
});

describe("extractKeywords", () => {
  it("caps each keyword list at 12 entries", async () => {
    const many = Array.from({ length: 20 }, (_, i) => `k${i}`);
    mockFetch(reply(JSON.stringify({ matchedKeywords: many, missingKeywords: many })));
    const result = await createGroqProvider("key").extractKeywords(input);
    expect(result.matchedKeywords).toHaveLength(12);
    expect(result.missingKeywords).toHaveLength(12);
  });

  it("uses a strict schema for CV-improvement JSON", async () => {
    const fetchMock = mockFetch(
      reply(JSON.stringify({ matchedKeywords: [], missingKeywords: [], suggestedRewrites: [] })),
    );
    await createGroqProvider("key").extractKeywords(input);
    expect(requestBody(fetchMock).response_format).toMatchObject({
      type: "json_schema",
      json_schema: { name: "keyword_analysis", strict: true },
    });
  });
});

describe("generateCoverLetter", () => {
  it.each([
    ["formal", "Professional, respectful tone."],
    ["warm", "Warm, genuine, enthusiastic tone."],
    ["confident", "Confident, impactful, ownership-focused tone."],
  ] as const)("injects the %s tone instruction", async (tone, expected) => {
    const fetchMock = mockFetch(reply("letter"));
    await createGroqProvider("key").generateCoverLetter(input, tone);
    expect(requestBody(fetchMock).messages[0].content).toContain(expected);
  });

  it("leaves a CV shorter than 10,000 characters untouched", async () => {
    const fetchMock = mockFetch(reply("letter"));
    const cvText = "z".repeat(3500);
    await createGroqProvider("key").generateCoverLetter({ cvText, jobDescription: "JD" });
    const user = requestBody(fetchMock).messages[1].content as string;
    expect(user).toContain(`CANDIDATE CV:\n${cvText}`);
    expect(user).not.toContain("[... CV truncated for performance ...]");
  });

  it("truncates beyond 10,000 characters at a nearby newline and keeps the notice", async () => {
    const fetchMock = mockFetch(reply("letter"));
    const retained = "z".repeat(9800);
    await createGroqProvider("key").generateCoverLetter({
      cvText: `${retained}\n${"x".repeat(500)}`,
      jobDescription: "JD",
    });
    const user = requestBody(fetchMock).messages[1].content as string;
    expect(user).toContain(`CANDIDATE CV:\n${retained}\n[... CV truncated for performance ...]`);
    expect(user).not.toContain("x");
    expect(user).toContain("[... CV truncated for performance ...]");
  });
});

describe("transport errors", () => {
  it("retries once with the fallback when the primary model is unavailable", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: false,
        status: 400,
        text: async () => JSON.stringify({ error: { code: "model_decommissioned" } }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ choices: [{ message: { content: "letter" } }] }),
      });
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      createGroqProvider("key", "openai/gpt-oss-120b", "openai/gpt-oss-20b").generateCoverLetter(
        input,
      ),
    ).resolves.toBe("letter");

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(JSON.parse(fetchMock.mock.calls[0][1].body).model).toBe("openai/gpt-oss-120b");
    expect(JSON.parse(fetchMock.mock.calls[1][1].body).model).toBe("openai/gpt-oss-20b");
  });

  it("retries once with the fallback after Groq rejects generated JSON", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: false,
        status: 400,
        text: async () => JSON.stringify({ error: { code: "json_validate_failed" } }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          choices: [
            {
              message: {
                content: JSON.stringify({ matchScore: 70, strengths: [], gaps: [] }),
              },
            },
          ],
        }),
      });
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      createGroqProvider("key", "openai/gpt-oss-120b", "openai/gpt-oss-20b").analyzeMatch(input),
    ).resolves.toMatchObject({ matchScore: 70 });
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(JSON.parse(fetchMock.mock.calls[1][1].body).model).toBe("openai/gpt-oss-20b");
  });

  it("does not fall back for an unrelated bad request", async () => {
    const fetchMock = mockFetch({ ok: false, status: 400, text: "invalid request" });
    await expect(createGroqProvider("key").generateCoverLetter(input)).rejects.toThrow(
      /Groq error 400: invalid request/,
    );
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it.each([
    [429, /Groq rate limit reached/],
    [401, /Groq API key rejected/],
    [403, /Groq API key rejected/],
    [500, /Groq error 500: boom/],
  ])("maps HTTP %s to a helpful message", async (status, expected) => {
    mockFetch({ ok: false, status, text: "boom" });
    await expect(createGroqProvider("key").generateCoverLetter(input)).rejects.toThrow(expected);
  });

  it("rejects an empty completion", async () => {
    mockFetch(reply(""));
    await expect(createGroqProvider("key").generateCoverLetter(input)).rejects.toThrow(
      "Groq returned empty response. Try again.",
    );
  });
});
