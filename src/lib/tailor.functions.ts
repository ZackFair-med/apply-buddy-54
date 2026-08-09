import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { getAIProvider } from "./ai";
import type { TailorInput, CoverLetterTone } from "./ai/types";
import { logNonFatal } from "./errors";


const inputSchema = z.object({
  cvId: z.string().uuid(),
  jobDescription: z.string().min(30).max(30000),
  jobTitle: z.string().max(200).optional(),
  company: z.string().max(200).optional(),
  jobId: z.string().uuid().optional(),
});

const letterInputSchema = inputSchema.extend({
  tone: z.enum(["formal", "warm", "confident"]).optional(),
});

type Input = z.infer<typeof inputSchema>;


async function loadContext(supabase: any, data: Input): Promise<TailorInput> {
  const { data: cv, error } = await supabase
    .from("cvs")
    .select("id, parsed_text, parse_error, label")
    .eq("id", data.cvId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!cv) throw new Error("CV not found");
  if (!cv.parsed_text) {
    throw new Error(
      `CV text not available${cv.parse_error ? `: ${cv.parse_error}` : ". Re-upload the file."}`,
    );
  }
  return {
    cvText: cv.parsed_text,
    jobDescription: data.jobDescription,
    jobTitle: data.jobTitle,
    company: data.company,
  };
}

async function upsertSession(
  supabase: any,
  userId: string,
  data: Input,
  patch: Record<string, unknown>,
  provider: { name: string; model: string },
) {
  // Try to update the most recent session for this cv+jd; else insert.
  // Persistence is best-effort: the AI result is already produced and returning it
  // matters more than the history row, but every failure is logged rather than dropped.
  const { data: existing, error: lookupError } = await supabase
    .from("tailor_sessions")
    .select("id")
    .eq("user_id", userId)
    .eq("cv_id", data.cvId)
    .eq("job_description", data.jobDescription)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (lookupError) {
    logNonFatal("tailor.upsertSession.lookup", lookupError);
    return;
  }

  const { error: writeError } = existing?.id
    ? await supabase.from("tailor_sessions").update(patch).eq("id", existing.id)
    : await supabase.from("tailor_sessions").insert({
        user_id: userId,
        cv_id: data.cvId,
        job_id: data.jobId ?? null,
        job_description: data.jobDescription,
        provider: provider.name,
        model: provider.model,
        ...patch,
      });
  if (writeError) logNonFatal("tailor.upsertSession.write", writeError);
}

async function guardLimit(
  supabase: any,
  userId: string,
  task: "match_score" | "keywords" | "cover_letter",
): Promise<{ limitReached: true; feature: typeof task; message: string } | null> {
  const { enforceAiLimit, LimitReachedError } = await import("./usage.server");
  try {
    await enforceAiLimit(supabase, userId, task);
    return null;
  } catch (e) {
    if (
      e instanceof LimitReachedError ||
      (e instanceof Error && e.message.startsWith("LIMIT_REACHED"))
    ) {
      return { limitReached: true, feature: task, message: e.message };
    }
    if (!(e instanceof Error)) {
      return { limitReached: true, feature: task, message: "Limit reached" };
    }
    throw e;
  }
}

export const analyzeMatch = createServerFn({ method: "POST" })
  .validator((d: unknown) => inputSchema.parse(d))
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }) => {
    const limited = await guardLimit(context.supabase, context.userId, "match_score");
    if (limited) return limited;
    const { logUsage } = await import("./usage.server");
    const input = await loadContext(context.supabase, data);
    const provider = getAIProvider();
    const result = await provider.analyzeMatch(input);
    await upsertSession(
      context.supabase,
      context.userId,
      data,
      {
        match_score: result.matchScore,
        strengths: result.strengths,
        weaknesses: result.weaknesses,
      },
      provider,
    );
    const { error: historyError } = await context.supabase.from("match_history").insert({
      user_id: context.userId,
      cv_id: data.cvId,
      job_id: data.jobId ?? null,
      job_title: data.jobTitle ?? null,
      company: data.company ?? null,
      match_score: result.matchScore,
      strengths: result.strengths,
      weaknesses: result.weaknesses,
    });
    if (historyError) logNonFatal("tailor.matchHistory", historyError);
    await logUsage(context.supabase, context.userId, "match_score");
    return result;
  });

export const extractKeywords = createServerFn({ method: "POST" })
  .validator((d: unknown) => inputSchema.parse(d))
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }) => {
    const limited = await guardLimit(context.supabase, context.userId, "keywords");
    if (limited) return limited;
    const { logUsage } = await import("./usage.server");
    const input = await loadContext(context.supabase, data);
    const provider = getAIProvider();
    const result = await provider.extractKeywords(input);
    await upsertSession(
      context.supabase,
      context.userId,
      data,
      {
        matched_keywords: result.matchedKeywords,
        missing_keywords: result.missingKeywords,
      },
      provider,
    );
    await logUsage(context.supabase, context.userId, "keywords");
    return result;
  });

export const generateCoverLetter = createServerFn({ method: "POST" })
  .validator((d: unknown) => letterInputSchema.parse(d))
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }) => {
    const limited = await guardLimit(context.supabase, context.userId, "cover_letter");
    if (limited) return limited;
    const { logUsage } = await import("./usage.server");

    let tone: CoverLetterTone | undefined = data.tone;
    if (tone) {
      const { data: profile, error: profileError } = await context.supabase
        .from("profiles")
        .select("plan")
        .eq("id", context.userId)
        .maybeSingle();
      if (profileError) throw new Error(profileError.message);
      if (profile?.plan !== "paid") tone = undefined;
    }

    const input = await loadContext(context.supabase, data);
    const provider = getAIProvider();
    const coverLetter = await provider.generateCoverLetter(input, tone);
    await upsertSession(
      context.supabase,
      context.userId,
      data,
      { cover_letter: coverLetter },
      provider,
    );
    await logUsage(context.supabase, context.userId, "cover_letter");
    return { coverLetter };
  });



