import { createFileRoute } from "@tanstack/react-router";

/**
 * Read-only deployment diagnostics. Reports ONLY whether server env vars are
 * present — never their values — and only to a caller that knows
 * `HEALTH_DIAGNOSTICS_TOKEN` (sent as `x-health-token` or `?token=`). Without a
 * configured or matching token the endpoint is a bare liveness check, so the
 * server's configuration surface isn't public.
 */
export const Route = createFileRoute("/api/public/health/config")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const headers = { "cache-control": "no-store" };
        const expected = process.env.HEALTH_DIAGNOSTICS_TOKEN?.trim();
        const provided =
          request.headers.get("x-health-token")?.trim() ??
          new URL(request.url).searchParams.get("token")?.trim();

        if (!expected || provided !== expected) {
          return Response.json({ ok: true }, { headers });
        }

        const present = (name: string) => Boolean(process.env[name]?.trim());
        return Response.json(
          {
            ok: true,
            env: {
              SUPABASE_URL: present("SUPABASE_URL"),
              SUPABASE_PUBLISHABLE_KEY: present("SUPABASE_PUBLISHABLE_KEY"),
              SUPABASE_SERVICE_ROLE_KEY: present("SUPABASE_SERVICE_ROLE_KEY"),
              ADZUNA_APP_ID: present("ADZUNA_APP_ID"),
              ADZUNA_APP_KEY: present("ADZUNA_APP_KEY"),
              JOBS_PROVIDER: process.env.JOBS_PROVIDER ?? "adzuna (default)",
              AI_API_KEY: present("AI_API_KEY"),
              AI_MODEL: process.env.AI_MODEL ?? "(default)",
              LOVABLE_API_KEY: present("LOVABLE_API_KEY"),
            },
          },
          { headers },
        );
      },
    },
  },
});
