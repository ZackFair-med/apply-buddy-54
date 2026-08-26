import { l as createServerFn } from "./esm-9EjmF9OT.mjs";
import { t as requireSupabaseAuth } from "./auth-middleware-B3XILrvZ.mjs";
import { t as createServerRpc } from "./createServerRpc-TAUNrjZd.mjs";
import { t as getPlanLimits } from "./plan-limits-CUWiZHSN.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/usage.functions-B7NMeXYG.js
function windowStart(window) {
	const d = /* @__PURE__ */ new Date();
	if (window === "day") d.setUTCHours(0, 0, 0, 0);
	else d.setUTCDate(d.getUTCDate() - 7);
	return d.toISOString();
}
async function countUsage(supabase, userId, task, window) {
	const { count, error } = await supabase.from("usage_logs").select("id", {
		count: "exact",
		head: true
	}).eq("user_id", userId).eq("task_type", task).gte("created_at", windowStart(window));
	if (error) throw new Error(`Could not read ${task} usage: ${error.message}`);
	return count ?? 0;
}
var getUsageSummary_createServerFn_handler = createServerRpc({
	id: "787e0a959e011f95b58ac21f04b325d4cce5874ea7030722a8665f02a6063c1d",
	name: "getUsageSummary",
	filename: "src/lib/usage.functions.ts"
}, (opts) => getUsageSummary.__executeServer(opts));
var getUsageSummary = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(getUsageSummary_createServerFn_handler, async ({ context }) => {
	const { supabase, userId } = context;
	const { data: profile, error: profileError } = await supabase.from("profiles").select("plan").eq("id", userId).maybeSingle();
	if (profileError) throw new Error(`Could not read plan: ${profileError.message}`);
	const plan = profile?.plan === "paid" ? "paid" : "free";
	const limits = getPlanLimits(plan);
	const coverWindow = limits.coverLetterPerDay != null ? "day" : "week";
	const coverLimit = limits.coverLetterPerDay ?? limits.coverLetterPerWeek ?? null;
	const [{ count: cvCount, error: cvError }, matchUsed, kwUsed, coverUsed] = await Promise.all([
		supabase.from("cvs").select("id", {
			count: "exact",
			head: true
		}).eq("user_id", userId),
		countUsage(supabase, userId, "match_score", "day"),
		countUsage(supabase, userId, "keywords", "day"),
		countUsage(supabase, userId, "cover_letter", coverWindow)
	]);
	if (cvError) throw new Error(`Could not read CV count: ${cvError.message}`);
	return {
		plan,
		cvProfiles: {
			used: cvCount ?? 0,
			limit: limits.cvProfiles
		},
		matchScore: {
			used: matchUsed,
			limit: limits.matchScorePerDay,
			window: "day"
		},
		keywords: {
			used: kwUsed,
			limit: limits.keywordsPerDay,
			window: "day"
		},
		coverLetter: {
			used: coverUsed,
			limit: coverLimit,
			window: coverWindow
		}
	};
});
//#endregion
export { getUsageSummary_createServerFn_handler };
