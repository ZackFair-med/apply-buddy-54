import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { callServerFn, validateInput } from "@/test/server-fn";
import { createSupabaseStub, opsFor, type SupabaseStubOptions } from "@/test/supabase";

vi.mock("@tanstack/react-start", async () => (await import("@/test/server-fn")).reactStartMock());

const analyzeMatchMock = vi.fn();
const extractKeywordsMock = vi.fn();
const generateCoverLetterMock = vi.fn();
const getAIProvider = vi.fn(() => ({
  name: "gemini",
  model: "gemini-flash-latest",
  analyzeMatch: analyzeMatchMock,
  extractKeywords: extractKeywordsMock,
  generateCoverLetter: generateCoverLetterMock,
}));

vi.mock("./ai", () => ({ getAIProvider: () => getAIProvider() }));

const enforceAiLimit = vi.fn();
const logUsage = vi.fn();

vi.mock("./usage.server", () => ({
  enforceAiLimit: (...args: unknown[]) => enforceAiLimit(...args),
  logUsage: (...args: unknown[]) => logUsage(...args),
}));

const { analyzeMatch, extractKeywords, generateCoverLetter } = await import("./tailor.functions");

const CV_ID = "11111111-1111-4111-8111-111111111111";
const JOB_ID = "22222222-2222-4222-8222-222222222222";

const input = {
  cvId: CV_ID,
  jobDescription: "A".repeat(40),
  jobTitle: "Frontend Engineer",
  company: "Acme",
};

function contextWith(overrides: SupabaseStubOptions["tables"] = {}) {
  const stub = createSupabaseStub({
    tables: {
      cvs: { data: { id: CV_ID, parsed_text: "CV text", parse_error: null }, error: null },
      tailor_sessions: { data: null, error: null },
      match_history: { data: null, error: null },
      profiles: { data: { plan: "free" }, error: null },
      ...overrides,
    },
  });
  return { ...stub, context: { supabase: stub.supabase, userId: "user-1" } };
}

beforeEach(() => {
  analyzeMatchMock.mockResolvedValue({ matchScore: 80, strengths: ["s"], weaknesses: ["w"] });
  extractKeywordsMock.mockResolvedValue({ matchedKeywords: ["react"], missingKeywords: ["go"] });
  generateCoverLetterMock.mockResolvedValue("Dear Acme");
  enforceAiLimit.mockResolvedValue("free");
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("input validation", () => {
  it("rejects a job description that is too short", () => {
    expect(() => validateInput(analyzeMatch, { ...input, jobDescription: "too short" })).toThrow();
  });

  it("rejects a non-uuid cv id", () => {
    expect(() => validateInput(analyzeMatch, { ...input, cvId: "nope" })).toThrow();
  });

  it("accepts an optional job id and tone on the cover-letter schema", () => {
    expect(
      validateInput(generateCoverLetter, { ...input, jobId: JOB_ID, tone: "warm" }),
    ).toMatchObject({ jobId: JOB_ID, tone: "warm" });
  });

  it("rejects an unknown tone", () => {
    expect(() => validateInput(generateCoverLetter, { ...input, tone: "sassy" })).toThrow();
  });
});

describe("analyzeMatch", () => {
  it("scores the CV, records the session and logs usage", async () => {
    const { context, ops } = contextWith();
    await expect(callServerFn(analyzeMatch, { data: input, context })).resolves.toEqual({
      matchScore: 80,
      strengths: ["s"],
      weaknesses: ["w"],
    });

    expect(analyzeMatchMock).toHaveBeenCalledWith({
      cvText: "CV text",
      jobDescription: input.jobDescription,
      jobTitle: "Frontend Engineer",
      company: "Acme",
    });
    expect(opsFor(ops, "tailor_sessions")).toContainEqual({
      name: "insert",
      args: [
        expect.objectContaining({
          user_id: "user-1",
          cv_id: CV_ID,
          job_id: null,
          provider: "gemini",
          model: "gemini-flash-latest",
          match_score: 80,
        }),
      ],
    });
    expect(opsFor(ops, "match_history")).toContainEqual({
      name: "insert",
      args: [expect.objectContaining({ match_score: 80, company: "Acme" })],
    });
    expect(logUsage).toHaveBeenCalledWith(context.supabase, "user-1", "match_score");
  });

  it("updates the latest session for the same CV and job description", async () => {
    const { context, ops } = contextWith({
      tailor_sessions: { data: { id: "session-1" }, error: null },
    });
    await callServerFn(analyzeMatch, { data: input, context });

    const sessionOps = opsFor(ops, "tailor_sessions");
    expect(sessionOps).toContainEqual({
      name: "update",
      args: [expect.objectContaining({ match_score: 80 })],
    });
    expect(sessionOps).not.toContainEqual(expect.objectContaining({ name: "insert" }));
  });

  it("returns a structured limit result without calling the provider", async () => {
    enforceAiLimit.mockRejectedValue(new Error("LIMIT_REACHED: match_score limit of 3 per day"));
    const { context } = contextWith();

    await expect(callServerFn(analyzeMatch, { data: input, context })).resolves.toEqual({
      limitReached: true,
      feature: "match_score",
      message: "LIMIT_REACHED: match_score limit of 3 per day",
    });
    expect(analyzeMatchMock).not.toHaveBeenCalled();
    expect(logUsage).not.toHaveBeenCalled();
  });

  it("falls back to a generic message for a non-Error limit failure", async () => {
    enforceAiLimit.mockRejectedValue("nope");
    const { context } = contextWith();

    await expect(callServerFn(analyzeMatch, { data: input, context })).resolves.toMatchObject({
      message: "Limit reached",
    });
  });

  it("fails when the CV row is missing", async () => {
    const { context } = contextWith({ cvs: { data: null, error: null } });
    await expect(callServerFn(analyzeMatch, { data: input, context })).rejects.toThrow(
      "CV not found",
    );
  });

  it("surfaces the stored parse error when the CV has no text", async () => {
    const { context } = contextWith({
      cvs: { data: { id: CV_ID, parsed_text: null, parse_error: "encrypted pdf" }, error: null },
    });
    await expect(callServerFn(analyzeMatch, { data: input, context })).rejects.toThrow(
      "CV text not available: encrypted pdf",
    );
  });

  it("asks the user to re-upload when there is no parse error", async () => {
    const { context } = contextWith({
      cvs: { data: { id: CV_ID, parsed_text: "", parse_error: null }, error: null },
    });
    await expect(callServerFn(analyzeMatch, { data: input, context })).rejects.toThrow(
      "CV text not available. Re-upload the file.",
    );
  });

  it("surfaces CV query errors", async () => {
    const { context } = contextWith({ cvs: { error: { message: "db down" } } });
    await expect(callServerFn(analyzeMatch, { data: input, context })).rejects.toThrow("db down");
  });
});

describe("extractKeywords", () => {
  it("stores matched and missing keywords on the session", async () => {
    const { context, ops } = contextWith();
    await expect(callServerFn(extractKeywords, { data: input, context })).resolves.toEqual({
      matchedKeywords: ["react"],
      missingKeywords: ["go"],
    });
    expect(opsFor(ops, "tailor_sessions")).toContainEqual({
      name: "insert",
      args: [expect.objectContaining({ matched_keywords: ["react"], missing_keywords: ["go"] })],
    });
    expect(logUsage).toHaveBeenCalledWith(context.supabase, "user-1", "keywords");
  });

  it("returns a structured limit result", async () => {
    enforceAiLimit.mockRejectedValue(new Error("LIMIT_REACHED"));
    const { context } = contextWith();
    await expect(callServerFn(extractKeywords, { data: input, context })).resolves.toMatchObject({
      limitReached: true,
      feature: "keywords",
    });
  });
});

describe("generateCoverLetter", () => {
  it("returns the letter and records the session", async () => {
    const { context, ops } = contextWith();
    await expect(callServerFn(generateCoverLetter, { data: input, context })).resolves.toEqual({
      coverLetter: "Dear Acme",
    });
    expect(generateCoverLetterMock).toHaveBeenCalledWith(expect.anything(), undefined);
    expect(opsFor(ops, "tailor_sessions")).toContainEqual({
      name: "insert",
      args: [expect.objectContaining({ cover_letter: "Dear Acme" })],
    });
  });

  it("keeps the requested tone for paid users", async () => {
    const { context } = contextWith({ profiles: { data: { plan: "paid" }, error: null } });
    await callServerFn(generateCoverLetter, { data: { ...input, tone: "confident" }, context });
    expect(generateCoverLetterMock).toHaveBeenCalledWith(expect.anything(), "confident");
  });

  it("drops the tone for free users", async () => {
    const { context } = contextWith({ profiles: { data: { plan: "free" }, error: null } });
    await callServerFn(generateCoverLetter, { data: { ...input, tone: "warm" }, context });
    expect(generateCoverLetterMock).toHaveBeenCalledWith(expect.anything(), undefined);
  });

  it("links the session to the job when a job id is given", async () => {
    const { context, ops } = contextWith();
    await callServerFn(generateCoverLetter, { data: { ...input, jobId: JOB_ID }, context });
    expect(opsFor(ops, "tailor_sessions")).toContainEqual({
      name: "insert",
      args: [expect.objectContaining({ job_id: JOB_ID })],
    });
  });

  it("returns a structured limit result", async () => {
    enforceAiLimit.mockRejectedValue(new Error("LIMIT_REACHED"));
    const { context } = contextWith();
    await expect(
      callServerFn(generateCoverLetter, { data: input, context }),
    ).resolves.toMatchObject({ limitReached: true, feature: "cover_letter" });
    expect(generateCoverLetterMock).not.toHaveBeenCalled();
  });
});
