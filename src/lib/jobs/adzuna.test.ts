import { afterEach, describe, expect, it, vi } from "vitest";
import { createAdzunaProvider } from "./adzuna";

function mockFetch(response: { ok?: boolean; status?: number; json?: unknown; text?: string }) {
  const fetchMock = vi.fn(async (_url: string) => ({
    ok: response.ok ?? true,
    status: response.status ?? 200,
    json: async () => response.json ?? {},
    text: async () => response.text ?? "",
  }));
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

function requestedUrl(fetchMock: ReturnType<typeof mockFetch>): URL {
  return new URL(fetchMock.mock.calls[0][0]);
}

const provider = createAdzunaProvider("app-id", "app-key");

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("createAdzunaProvider", () => {
  it("is named adzuna", () => {
    expect(provider.name).toBe("adzuna");
  });

  it("defaults to page 1 of the gb board with 20 results", async () => {
    const fetchMock = mockFetch({ json: { results: [], count: 0 } });
    await provider.search({ keywords: "react" });
    const url = requestedUrl(fetchMock);
    expect(url.pathname).toBe("/v1/api/jobs/gb/search/1");
    expect(url.searchParams.get("what")).toBe("react");
    expect(url.searchParams.get("results_per_page")).toBe("20");
    expect(url.searchParams.get("app_id")).toBe("app-id");
    expect(url.searchParams.get("app_key")).toBe("app-key");
  });

  it("lowercases the country and clamps paging", async () => {
    const fetchMock = mockFetch({ json: { results: [] } });
    await provider.search({ keywords: "react", country: "US", page: 0, results_per_page: 500 });
    const url = requestedUrl(fetchMock);
    expect(url.pathname).toBe("/v1/api/jobs/us/search/1");
    expect(url.searchParams.get("results_per_page")).toBe("50");
  });

  it("clamps results_per_page to at least 1", async () => {
    const fetchMock = mockFetch({ json: { results: [] } });
    await provider.search({ keywords: "react", results_per_page: 0 });
    expect(requestedUrl(fetchMock).searchParams.get("results_per_page")).toBe("1");
  });

  it("maps optional filters onto query params", async () => {
    const fetchMock = mockFetch({ json: { results: [] } });
    await provider.search({
      keywords: "react",
      what_exclude: "senior",
      location: "London",
      radius: 12.6,
      salary_min: 40000,
      salary_max: 90000,
      full_time: true,
      part_time: true,
      contract: true,
      permanent: true,
      category: "it-jobs",
      max_days_old: 7,
      sort_by: "date",
    });
    const params = requestedUrl(fetchMock).searchParams;
    expect(Object.fromEntries(params)).toMatchObject({
      what_exclude: "senior",
      where: "London",
      distance: "13",
      salary_min: "40000",
      salary_max: "90000",
      full_time: "1",
      part_time: "1",
      contract: "1",
      permanent: "1",
      category: "it-jobs",
      max_days_old: "7",
      sort_by: "date",
    });
  });

  it("caps the radius at 50 miles", async () => {
    const fetchMock = mockFetch({ json: { results: [] } });
    await provider.search({ keywords: "react", radius: 500 });
    expect(requestedUrl(fetchMock).searchParams.get("distance")).toBe("50");
  });

  it("omits a zero radius and the default relevance sort", async () => {
    const fetchMock = mockFetch({ json: { results: [] } });
    await provider.search({ keywords: "react", radius: 0, sort_by: "relevance" });
    const params = requestedUrl(fetchMock).searchParams;
    expect(params.has("distance")).toBe(false);
    expect(params.has("sort_by")).toBe(false);
  });

  it("normalises results and formats a salary range", async () => {
    mockFetch({
      json: {
        count: 137,
        results: [
          {
            id: 12345,
            title: "Frontend Engineer",
            description: "Build things",
            company: { display_name: "Acme" },
            location: { display_name: "London, UK" },
            redirect_url: "https://adzuna.test/job/12345",
            created: "2026-03-01T09:00:00Z",
            salary_min: 50000.4,
            salary_max: 70000,
          },
        ],
      },
    });
    const { results, totalCount } = await provider.search({ keywords: "react" });
    expect(totalCount).toBe(137);
    expect(results[0]).toEqual({
      id: "12345",
      title: "Frontend Engineer",
      company: "Acme",
      location: "London, UK",
      salary: "50,000–70,000",
      description: "Build things",
      url: "https://adzuna.test/job/12345",
      postedAt: "2026-03-01T09:00:00Z",
      source: "adzuna",
    });
  });

  it("renders a single figure when min and max match or only one is set", async () => {
    mockFetch({
      json: {
        results: [
          {
            id: 1,
            title: "a",
            description: "",
            redirect_url: "u",
            created: "c",
            salary_min: 60000,
            salary_max: 60000,
          },
          {
            id: 2,
            title: "b",
            description: "",
            redirect_url: "u",
            created: "c",
            salary_max: 80000,
          },
        ],
      },
    });
    const { results } = await provider.search({ keywords: "react" });
    expect(results.map((r) => r.salary)).toEqual(["60,000", "80,000"]);
  });

  it("leaves salary, company and location undefined when absent", async () => {
    mockFetch({
      json: { results: [{ id: 3, title: "c", description: "", redirect_url: "u", created: "c" }] },
    });
    const { results, totalCount } = await provider.search({ keywords: "react" });
    expect(results[0]).toMatchObject({ company: "", location: undefined, salary: undefined });
    expect(totalCount).toBe(1);
  });

  it("falls back to an empty result set", async () => {
    mockFetch({ json: {} });
    await expect(provider.search({ keywords: "react" })).resolves.toEqual({
      results: [],
      totalCount: 0,
    });
  });

  it("throws a truncated error on a failed response", async () => {
    mockFetch({ ok: false, status: 401, text: "x".repeat(400) });
    await expect(provider.search({ keywords: "react" })).rejects.toThrow(
      `Adzuna error 401: ${"x".repeat(300)}`,
    );
  });
});
