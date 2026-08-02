import { afterEach, describe, expect, it, vi } from "vitest";
import { SUPPORTED_COUNTRIES, getJobsProvider, searchJobs } from "./index";

function setEnv(env: Record<string, string | undefined>) {
  for (const [key, value] of Object.entries(env)) vi.stubEnv(key, value);
}

const credentials = { ADZUNA_APP_ID: "id", ADZUNA_APP_KEY: "key" };

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("getJobsProvider", () => {
  it("defaults to adzuna when no provider is configured", () => {
    setEnv({ JOBS_PROVIDER: undefined, JOB_SEARCH_PROVIDER: undefined, ...credentials });
    expect(getJobsProvider().name).toBe("adzuna");
  });

  it("reads the legacy JOB_SEARCH_PROVIDER variable", () => {
    setEnv({ JOBS_PROVIDER: undefined, JOB_SEARCH_PROVIDER: "Adzuna", ...credentials });
    expect(getJobsProvider().name).toBe("adzuna");
  });

  it.each(["  ADZUNA  ", "https://developer.adzuna.com"])(
    "resolves the sloppy value %s to adzuna",
    (raw) => {
      setEnv({ JOBS_PROVIDER: raw, ...credentials });
      expect(getJobsProvider().name).toBe("adzuna");
    },
  );

  it("throws an actionable error when credentials are missing", () => {
    setEnv({ JOBS_PROVIDER: "adzuna", ADZUNA_APP_ID: "  ", ADZUNA_APP_KEY: "key" });
    expect(() => getJobsProvider()).toThrow(/ADZUNA_APP_ID \/ ADZUNA_APP_KEY are missing/);
  });

  it("rejects unknown providers", () => {
    setEnv({ JOBS_PROVIDER: "jsearch", ...credentials });
    expect(() => getJobsProvider()).toThrow("Unsupported JOBS_PROVIDER: jsearch");
  });
});

describe("searchJobs", () => {
  it("delegates to the configured provider", async () => {
    setEnv({ JOBS_PROVIDER: "adzuna", ...credentials });
    const fetchMock = vi.fn(async () => ({
      ok: true,
      status: 200,
      json: async () => ({ results: [], count: 0 }),
      text: async () => "",
    }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(searchJobs({ keywords: "react" })).resolves.toEqual({
      results: [],
      totalCount: 0,
    });
    expect(fetchMock).toHaveBeenCalledOnce();
  });
});

describe("SUPPORTED_COUNTRIES", () => {
  it("lists unique lowercase ISO codes", () => {
    const codes = SUPPORTED_COUNTRIES.map((c) => c.code);
    expect(new Set(codes).size).toBe(codes.length);
    expect(codes.every((c) => /^[a-z]{2}$/.test(c))).toBe(true);
  });
});
