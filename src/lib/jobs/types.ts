export type SortBy = "date" | "salary" | "relevance";

export interface JobSearchQuery {
  keywords: string;
  location?: string;
  /** ISO 2-letter country code — required by Adzuna. Defaults to "gb". */
  country?: string;
  page?: number;

  what_exclude?: string;
  /** Distance in miles from `location` (Adzuna: 0-50). */
  radius?: number;
  salary_min?: number;
  salary_max?: number;

  full_time?: boolean;
  part_time?: boolean;
  contract?: boolean;
  permanent?: boolean;

  category?: string;
  max_days_old?: number;
  sort_by?: SortBy;
  results_per_page?: number;
}

export interface JobSearchResult {
  id: string;
  title: string;
  company: string;
  location?: string;
  salary?: string;
  description?: string;
  url: string;
  postedAt?: string;
  source: string;
  matchScore?: number;
}

export interface JobSearchResponse {
  results: JobSearchResult[];
  totalCount: number;
}

export interface JobSearchProvider {
  name: string;
  search(query: JobSearchQuery): Promise<JobSearchResponse>;
}

export const SUPPORTED_COUNTRIES: { code: string; name: string }[] = [
  { code: "gb", name: "United Kingdom" },
  { code: "us", name: "United States" },
  { code: "at", name: "Austria" },
  { code: "au", name: "Australia" },
  { code: "be", name: "Belgium" },
  { code: "br", name: "Brazil" },
  { code: "ca", name: "Canada" },
  { code: "ch", name: "Switzerland" },
  { code: "de", name: "Germany" },
  { code: "es", name: "Spain" },
  { code: "fr", name: "France" },
  { code: "in", name: "India" },
  { code: "it", name: "Italy" },
  { code: "mx", name: "Mexico" },
  { code: "nl", name: "Netherlands" },
  { code: "nz", name: "New Zealand" },
  { code: "pl", name: "Poland" },
  { code: "sg", name: "Singapore" },
  { code: "za", name: "South Africa" },
];
