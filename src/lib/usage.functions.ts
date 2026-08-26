import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { getPlanLimits, type Plan } from "./plan-limits";

export type UsageSummary = {
  plan: Plan;
  cvProfiles: { used: number; limit: number | null };
  matchScore: { used: number; limit: number | null; window: "day" };
  keywords: { used: number; limit: number | null; window: "day" };
  coverLetter: { used: number; limit: number | null; window: "day" | "week" };
};

function windowStart(window: "day" | "week"): string {
  const d = new Date();
  if (window === "day") d.setUTCHours(0, 0, 0, 0);
  else d.setUTCDate(d.getUTCDate() - 7);
  return d.toISOString();
}

async function countUsage(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  userId: string,
  task: "match_score" | "keywords" | "cover_letter",
  window: "day" | "week",
): Promise<number> {
  const { count, error } = await supabase
    .from("usage_logs")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("task_type", task)
    .gte("created_at", windowStart(window));
  // Swallowing this would render a reassuring "0 used" instead of the real quota.
  if (error) throw new Error(`Could not read ${task} usage: ${error.message}`);
  return count ?? 0;
}

export const getUsageSummary = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<UsageSummary> => {
    const { supabase, userId } = context;

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("plan")
      .eq("id", userId)
      .maybeSingle();
    if (profileError) throw new Error(`Could not read plan: ${profileError.message}`);
    const plan: Plan = (profile as { plan?: string } | null)?.plan === "paid" ? "paid" : "free";
    const limits = getPlanLimits(plan);

    const coverWindow: "day" | "week" = limits.coverLetterPerDay != null ? "day" : "week";
    const coverLimit = limits.coverLetterPerDay ?? (limits as { coverLetterPerWeek?: number | null }).coverLetterPerWeek ?? null;

    const [{ count: cvCount, error: cvError }, matchUsed, kwUsed, coverUsed] = await Promise.all([
      supabase.from("cvs").select("id", { count: "exact", head: true }).eq("user_id", userId),
      countUsage(supabase, userId, "match_score", "day"),
      countUsage(supabase, userId, "keywords", "day"),
      countUsage(supabase, userId, "cover_letter", coverWindow),
    ]);

    if (cvError) throw new Error(`Could not read CV count: ${cvError.message}`);

    return {
      plan,
      cvProfiles: { used: cvCount ?? 0, limit: limits.cvProfiles },
      matchScore: { used: matchUsed, limit: limits.matchScorePerDay, window: "day" },
      keywords: { used: kwUsed, limit: limits.keywordsPerDay, window: "day" },
      coverLetter: { used: coverUsed, limit: coverLimit, window: coverWindow },
    };
  });
