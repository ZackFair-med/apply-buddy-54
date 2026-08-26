import type { SupabaseClient } from "@supabase/supabase-js";
import { getPlanLimits, type Plan } from "./plan-limits";
import { logNonFatal } from "./errors";

export type TaskType = "match_score" | "keywords" | "cover_letter";

export class LimitReachedError extends Error {
  code = "LIMIT_REACHED" as const;
  constructor(
    public task: TaskType,
    public limit: number,
    public window: "day" | "week",
    public plan: Plan,
  ) {
    super(
      `LIMIT_REACHED: ${task} limit of ${limit} per ${window} reached on ${plan} plan.`,
    );
  }
}

export class CvLimitReachedError extends Error {
  code = "CV_LIMIT_REACHED" as const;
  constructor(
    public limit: number,
    public plan: Plan,
  ) {
    super(
      `CV_LIMIT_REACHED: You can store up to ${limit} CV${limit === 1 ? "" : "s"} on the ${plan} plan.`,
    );
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getUserPlan(supabase: SupabaseClient<any>, userId: string): Promise<Plan> {
  const { data, error } = await supabase
    .from("profiles")
    .select("plan")
    .eq("id", userId)
    .maybeSingle();
  if (error) throw new Error(`Could not resolve plan: ${error.message}`);
  const plan = (data as { plan?: string } | null)?.plan;
  return plan === "paid" ? "paid" : "free";
}

function windowStart(window: "day" | "week"): string {
  const d = new Date();
  if (window === "day") {
    d.setUTCHours(0, 0, 0, 0);
  } else {
    d.setUTCDate(d.getUTCDate() - 7);
  }
  return d.toISOString();
}

/**
 * Throws LimitReachedError if the user has hit their plan limit for this task.
 * Returns the resolved plan so callers can reuse it.
 */
export async function enforceAiLimit(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: SupabaseClient<any>,
  userId: string,
  task: TaskType,
): Promise<Plan> {
  const plan = await getUserPlan(supabase, userId);
  const limits = getPlanLimits(plan);

  let limit: number | null;
  let window: "day" | "week";

  switch (task) {
    case "match_score":
      limit = limits.matchScorePerDay;
      window = "day";
      break;
    case "keywords":
      limit = limits.keywordsPerDay;
      window = "day";
      break;
    case "cover_letter": {
      const perDay = limits.coverLetterPerDay;
      const perWeek = (limits as { coverLetterPerWeek?: number | null }).coverLetterPerWeek ?? null;
      if (perDay != null) {
        limit = perDay;
        window = "day";
      } else {
        limit = perWeek;
        window = "week";
      }
      break;
    }
  }

  if (limit == null) return plan; // unlimited

  const { count, error } = await supabase
    .from("usage_logs")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("task_type", task)
    .gte("created_at", windowStart(window));
  if (error) throw new Error(error.message);

  if ((count ?? 0) >= limit) {
    throw new LimitReachedError(task, limit, window, plan);
  }
  return plan;
}

export async function logUsage(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: SupabaseClient<any>,
  userId: string,
  task: TaskType,
): Promise<void> {
  const { error } = await supabase.from("usage_logs").insert({ user_id: userId, task_type: task });
  // Never fail a completed AI run over accounting, but make the gap visible:
  // an unlogged run silently grants the user an extra one against their quota.
  if (error) logNonFatal("usage.logUsage", new Error(`${task} for ${userId}: ${error.message}`));
}

export async function enforceCvLimit(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: SupabaseClient<any>,
  userId: string,
): Promise<void> {
  const plan = await getUserPlan(supabase, userId);
  const limit = getPlanLimits(plan).cvProfiles;
  if (limit == null) return;

  const { count, error } = await supabase
    .from("cvs")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId);
  if (error) throw new Error(error.message);

  if ((count ?? 0) >= limit) {
    throw new CvLimitReachedError(limit, plan);
  }
}
