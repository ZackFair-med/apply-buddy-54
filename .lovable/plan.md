## What's actually happening

The confirmation link worked. Your pasted URL contains a valid, freshly-issued session:

```text
http://localhost:3000/#access_token=...&refresh_token=...&type=signup
```

The token says `email_verified: true`, so the account **was** confirmed. The only failure is *where* Supabase sent you afterwards: `http://localhost:3000`, which is the default **Site URL** of a brand-new Supabase project. Nothing is listening there, so the browser shows a connection error.

Two settings cause this:
- **Site URL** is still `http://localhost:3000` instead of your Vercel domain.
- `https://<your-app>.vercel.app/auth/callback` is not in **Additional redirect URLs**, so Supabase discarded the app's requested `emailRedirectTo` and fell back to the Site URL.

This is configuration in your own Supabase project, not an app bug — no amount of code change fixes it while Site URL points at localhost.

## Steps you need to do (Supabase dashboard)

**Authentication → URL Configuration**

- Site URL: `https://<your-app>.vercel.app`
- Additional redirect URLs (one per line):
  - `https://<your-app>.vercel.app/**`
  - `http://localhost:8080/**`

Save, then sign up with a fresh email and open the new confirmation link. Old links keep the old redirect baked in, so they will still land on localhost.

If you'd rather not deal with confirmation emails at all right now: **Authentication → Providers → Email → Confirm email = off** makes sign-up sign the user straight in.

Note the `**` wildcard: Vercel preview deployments use different subdomains, so add `https://<your-app>-*.vercel.app/**` too if you want previews to work.

## Code changes I'll make to harden this

These don't replace the dashboard fix, but they stop the same class of failure from being a dead end:

1. **Handle a session arriving at `/`** — Supabase's Site-URL fallback always drops tokens on the site root as a URL hash. Currently `/` is the protected dashboard, so a hash-token landing has no handler. I'll add a small check in the root route: if the URL hash contains `access_token` / `type=signup` or `type=recovery`, let Supabase consume it, then route to the dashboard (or `/reset-password` for recovery) and clean the hash. That way a misconfigured redirect still signs the user in instead of stranding them.

2. **Surface the real error on the callback route** — `/auth/callback` currently polls for a session for 3s and then silently sends you to `/auth`. I'll read `error`, `error_code`, and `error_description` from both the query string and the hash and show them (e.g. "This confirmation link has expired — request a new one"), with a button back to sign-in.

3. **Post-signup screen guidance** — the "Check your email" card will mention that the link must open on this domain, so a localhost bounce is immediately recognisable.

4. **`deploy/README.md`** — add this exact symptom (`confirmation link opens localhost:3000`) to the troubleshooting list with the Site URL / redirect URL fix, since it's the most common Vercel cutover mistake.

## Technical details

- Files touched: `src/routes/__root.tsx` (or a small `useAuthHashRedirect` hook it renders), `src/routes/auth.callback.tsx`, `src/routes/auth.tsx`, `deploy/README.md`.
- The hash-token handling must be client-only (`useEffect`) — the server never sees the URL fragment, and the Supabase client is configured with `detectSessionInUrl` at its default (`true`), so it already exchanges the hash; the code only needs to wait for the session and then navigate.
- No database migration, no schema change, no change to the sign-in/sign-up logic itself.
