import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const getProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("profiles")
      .select("*")
      .eq("id", context.userId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data;
  });

const updateSchema = z.object({
  first_name: z.string().trim().max(100).nullable().optional(),
  last_name: z.string().trim().max(100).nullable().optional(),
  display_name: z.string().trim().max(200).nullable().optional(),
  target_title: z.string().trim().max(200).nullable().optional(),
  target_date: z.string().nullable().optional(),
  target_salary_min: z.number().int().min(0).max(10000000).nullable().optional(),
  target_salary_max: z.number().int().min(0).max(10000000).nullable().optional(),
  target_salary_currency: z.string().trim().max(10).nullable().optional(),
  weekly_goal: z.number().int().min(1).max(100).nullable().optional(),
});

export const updateProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => updateSchema.parse(d))
  .handler(async ({ data, context }) => {
    const patch: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(data)) {
      if (v === undefined) continue;
      patch[k] = typeof v === "string" ? (v.length ? v : null) : v;
    }

    const { data: row, error } = await context.supabase
      .from("profiles")
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .update(patch as any)
      .eq("id", context.userId)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const deleteAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.auth.admin.deleteUser(context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
