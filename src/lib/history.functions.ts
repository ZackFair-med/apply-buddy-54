import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type MatchHistoryItem = {
  id: string;
  cv_id: string | null;
  job_id: string | null;
  job_title: string | null;
  company: string | null;
  match_score: number;
  strengths: string[];
  weaknesses: string[];
  created_at: string;
  cv_label: string | null;
};

export const listMatchHistory = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<{ paid: boolean; items: MatchHistoryItem[] }> => {
    const { supabase, userId } = context;
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("plan")
      .eq("id", userId)
      .maybeSingle();
    // Otherwise a failed lookup silently downgrades a paid user to an empty history.
    if (profileError) throw new Error(`Could not read plan: ${profileError.message}`);
    const paid = (profile as { plan?: string } | null)?.plan === "paid";
    if (!paid) return { paid: false, items: [] };

    const { data, error } = await supabase
      .from("match_history")
      .select("id, cv_id, job_id, job_title, company, match_score, strengths, weaknesses, created_at, cvs(label)")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(500);
    if (error) throw new Error(error.message);
    const items = (data ?? []).map((r: any) => ({
      id: r.id,
      cv_id: r.cv_id,
      job_id: r.job_id,
      job_title: r.job_title,
      company: r.company,
      match_score: r.match_score,
      strengths: r.strengths ?? [],
      weaknesses: r.weaknesses ?? [],
      created_at: r.created_at,
      cv_label: r.cvs?.label ?? null,
    }));
    return { paid: true, items };
  });
