export function errorMessage(e: unknown, fallback = "Unexpected error"): string {
  if (e instanceof Error) return e.message;
  if (typeof e === "string" && e) return e;
  return fallback;
}

/**
 * Reports a failure that must not abort the current request (e.g. best-effort
 * persistence after an AI call the user already paid for) without hiding it.
 */
export function logNonFatal(scope: string, e: unknown): void {
  console.error(`[${scope}] ${errorMessage(e)}`, e);
}
