import type { JobSearchQuery, JobSearchResponse } from "./types";

export function getJobsProvider() {
  throw new Error("Job search feature has been removed from this application.");
}

/** Single entry point used by the rest of the app. */
export function searchJobs(params: JobSearchQuery): Promise<JobSearchResponse> {
  throw new Error("Job search feature has been removed from this application.");
}
