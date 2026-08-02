import type { JobSearchProvider, JobSearchQuery, JobSearchResponse } from "./types";

interface AdzunaJob {
  id: string | number;
  title: string;
  description: string;
  company?: { display_name?: string };
  location?: { display_name?: string };
  redirect_url: string;
  created: string;
  salary_min?: number;
  salary_max?: number;
  salary_is_predicted?: string;
  contract_type?: string; // "permanent" | "contract"
  contract_time?: string; // "full_time" | "part_time"
  category?: { label?: string; tag?: string };
}

function fmtSalary(min?: number, max?: number): string | undefined {
  if (!min && !max) return undefined;
  const fmt = (n: number) => Math.round(n).toLocaleString();
  if (min && max && min !== max) return `${fmt(min)}–${fmt(max)}`;
  return fmt((min ?? max)!);
}

export function createAdzunaProvider(appId: string, appKey: string): JobSearchProvider {
  return {
    name: "adzuna",
    async search(q: JobSearchQuery): Promise<JobSearchResponse> {
      const country = (q.country ?? "gb").toLowerCase();
      const page = Math.max(1, q.page ?? 1);
      const perPage = Math.min(50, Math.max(1, q.results_per_page ?? 20));

      const params = new URLSearchParams({
        app_id: appId,
        app_key: appKey,
        results_per_page: String(perPage),
        what: q.keywords,
        "content-type": "application/json",
      });
      if (q.what_exclude) params.set("what_exclude", q.what_exclude);
      if (q.location) params.set("where", q.location);
      if (typeof q.radius === "number" && q.radius > 0) {
        params.set("distance", String(Math.min(50, Math.max(0, Math.round(q.radius)))));
      }
      if (typeof q.salary_min === "number") params.set("salary_min", String(q.salary_min));
      if (typeof q.salary_max === "number") params.set("salary_max", String(q.salary_max));
      if (q.full_time) params.set("full_time", "1");
      if (q.part_time) params.set("part_time", "1");
      if (q.contract) params.set("contract", "1");
      if (q.permanent) params.set("permanent", "1");
      if (q.category) params.set("category", q.category);
      if (typeof q.max_days_old === "number") params.set("max_days_old", String(q.max_days_old));
      if (q.sort_by && q.sort_by !== "relevance") params.set("sort_by", q.sort_by);

      const url = `https://api.adzuna.com/v1/api/jobs/${country}/search/${page}?${params.toString()}`;
      const res = await fetch(url);
      if (!res.ok) {
        const t = await res.text();
        throw new Error(`Adzuna error ${res.status}: ${t.slice(0, 300)}`);
      }
      const data = (await res.json()) as { results?: AdzunaJob[]; count?: number };
      const results = (data.results ?? []).map((j) => ({
        id: String(j.id),
        title: j.title,
        company: j.company?.display_name ?? "",
        location: j.location?.display_name,
        salary: fmtSalary(j.salary_min, j.salary_max),
        description: j.description,
        url: j.redirect_url,
        postedAt: j.created,
        source: "adzuna",
      }));
      return { results, totalCount: data.count ?? results.length };
    },
  };
}
