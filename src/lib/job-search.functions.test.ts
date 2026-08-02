import { afterEach, describe, expect, it, vi } from "vitest";
import { callServerFn, validateInput } from "@/test/server-fn";

vi.mock("@tanstack/react-start", async () => (await import("@/test/server-fn")).reactStartMock());

const providerSearch = vi.fn();
vi.mock("./jobs", () => ({ searchJobs: (...args: unknown[]) => providerSearch(...args) }));

const { searchJobs, getJobCategories } = await import("./job-search.functions");

function mockFetch(response: { ok?: boolean; status?: number; json?: unknown }) {
  const fetchMock = vi.fn(async (_url: string) => ({
    ok: response.ok ?? true,
    status: response.status ?? 200,
    json: async () => response.json ?? {},
    text: async () => "",
  }));
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  vi.clearAllMocks();
});

describe("searchJobs", () => {
  it("passes the validated query through to the provider", async () => {
    providerSearch.mockResolvedValue({ results: [], totalCount: 0 });
    await expect(
      callServerFn(searchJobs, { data: { keywords: "react", country: "gb" } }),
    ).resolves.toEqual({ results: [], totalCount: 0 });
    expect(providerSearch).toHaveBeenCalledWith({ keywords: "react", country: "gb" });
  });

  it("rejects empty keywords", () => {
    expect(() => validateInput(searchJobs, { keywords: "" })).toThrow();
  });

  it("rejects a country code that is not two letters", () => {
    expect(() => validateInput(searchJobs, { keywords: "react", country: "gbr" })).toThrow();
  });

  it("rejects out-of-range paging, radius and page size", () => {
    expect(() => validateInput(searchJobs, { keywords: "react", page: 0 })).toThrow();
    expect(() => validateInput(searchJobs, { keywords: "react", radius: 51 })).toThrow();
    expect(() => validateInput(searchJobs, { keywords: "react", results_per_page: 51 })).toThrow();
  });

  it("rejects an unknown sort option", () => {
    expect(() => validateInput(searchJobs, { keywords: "react", sort_by: "closest" })).toThrow();
  });
});

describe("getJobCategories", () => {
  it("maps the Adzuna categories for the requested country", async () => {
    vi.stubEnv("ADZUNA_APP_ID", "id");
    vi.stubEnv("ADZUNA_APP_KEY", "key");
    const fetchMock = mockFetch({
      json: { results: [{ tag: "it-jobs", label: "IT Jobs", extra: 1 }] },
    });

    await expect(callServerFn(getJobCategories, { data: { country: "US" } })).resolves.toEqual([
      { tag: "it-jobs", label: "IT Jobs" },
    ]);
    const url = new URL(fetchMock.mock.calls[0][0]);
    expect(url.pathname).toBe("/v1/api/jobs/us/categories");
    expect(url.searchParams.get("app_id")).toBe("id");
  });

  it("returns an empty list when Adzuna sends no results", async () => {
    vi.stubEnv("ADZUNA_APP_ID", "id");
    vi.stubEnv("ADZUNA_APP_KEY", "key");
    mockFetch({ json: {} });
    await expect(callServerFn(getJobCategories, { data: { country: "gb" } })).resolves.toEqual([]);
  });

  it("throws when credentials are not configured", async () => {
    vi.stubEnv("ADZUNA_APP_ID", undefined);
    vi.stubEnv("ADZUNA_APP_KEY", "key");
    await expect(callServerFn(getJobCategories, { data: { country: "gb" } })).rejects.toThrow(
      "ADZUNA_APP_ID / ADZUNA_APP_KEY not configured",
    );
  });

  it("throws on a failed Adzuna response", async () => {
    vi.stubEnv("ADZUNA_APP_ID", "id");
    vi.stubEnv("ADZUNA_APP_KEY", "key");
    mockFetch({ ok: false, status: 503 });
    await expect(callServerFn(getJobCategories, { data: { country: "gb" } })).rejects.toThrow(
      "Adzuna categories error 503",
    );
  });

  it("rejects an invalid country code", () => {
    expect(() => validateInput(getJobCategories, { country: "usa" })).toThrow();
  });
});
