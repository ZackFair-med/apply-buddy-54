export type Plan = "free" | "paid";

/**
 * Per-plan limits. `null` means unlimited.
 * Keep both weekly and daily cover-letter keys on every plan so consumers can
 * read either key without conditional shape checks.
 */
export const PLAN_LIMITS = {
  free: {
    cvProfiles: 1,
    matchScorePerDay: 3,
    keywordsPerDay: 2,
    coverLetterPerWeek: 1,
    coverLetterPerDay: null,
  },
  paid: {
    cvProfiles: 5,
    matchScorePerDay: null,
    keywordsPerDay: null,
    coverLetterPerWeek: null,
    coverLetterPerDay: 15,
  },
} as const satisfies Record<
  Plan,
  {
    cvProfiles: number | null;
    matchScorePerDay: number | null;
    keywordsPerDay: number | null;
    coverLetterPerWeek: number | null;
    coverLetterPerDay: number | null;
  }
>;

export type PlanLimits = (typeof PLAN_LIMITS)[Plan];

export function getPlanLimits(plan: Plan | null | undefined): PlanLimits {
  return PLAN_LIMITS[plan ?? "free"];
}
