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
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("createGroqProvider", () => {
  it("strips the vendor prefix from the model id", () => {
    expect(createGroqProvider("key")).toMatchObject({
      name: "groq",
      model: "llama-3.3-70b-versatile",
    });
    expect(createGroqProvider("key", "mixtral-8x7b-32768").model).toBe("mixtral-8x7b-32768");
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
  it("clamps the score, caps bullets and requests JSON", async () => {
    const fetchMock = mockFetch(
      reply(JSON.stringify({ matchScore: -5, strengths: ["a", "b", "c", "d", "e", "f"] })),
    );
    await expect(createGroqProvider("key").analyzeMatch(input)).resolves.toEqual({
      matchScore: 0,
      strengths: ["a", "b", "c", "d", "e"],
      weaknesses: [],
      gaps: [],
    });
    expect(requestBody(fetchMock).response_format).toEqual({ type: "json_object" });
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

  it("truncates a long CV in the prompt", async () => {
    const fetchMock = mockFetch(reply("letter"));
    await createGroqProvider("key").generateCoverLetter({
      cvText: "z".repeat(3500),
      jobDescription: "JD",
    });
    const user = requestBody(fetchMock).messages[1].content as string;
    expect(user).toContain("[... CV truncated for performance ...]");
    expect(user).not.toContain("z".repeat(3001));
  });
});

describe("transport errors", () => {
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
