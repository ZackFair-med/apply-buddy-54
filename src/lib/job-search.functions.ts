import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// Job search has been removed. Keep server functions in place so imports don't break,
// but always return a clear error to callers.
const anySchema = z.any();

export const searchJobs = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => anySchema.parse(d))
  .handler(async () => {
    throw new Error("Job search feature has been removed from this application.");
  });

export const getJobCategories = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => anySchema.parse(d))
  .handler(async () => {
    throw new Error("Job search feature has been removed from this application.");
  });
