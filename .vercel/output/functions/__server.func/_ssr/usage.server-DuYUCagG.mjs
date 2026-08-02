import { n as logNonFatal } from "./errors-CRpvjv8q.mjs";
import { t as getPlanLimits } from "./plan-limits-BTcbeEK0.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/usage.server-DuYUCagG.js
var LimitReachedError = class extends Error {
	task;
	limit;
	window;
	plan;
	code = "LIMIT_REACHED";
	constructor(task, limit, window, plan) {
		super(`LIMIT_REACHED: ${task} limit of ${limit} per ${window} reached on ${plan} plan.`);
		this.task = task;
		this.limit = limit;
		this.window = window;
		this.plan = plan;
	}
};
var CvLimitReachedError = class extends Error {
	limit;
	plan;
	code = "CV_LIMIT_REACHED";
	constructor(limit, plan) {
		super(`CV_LIMIT_REACHED: You can store up to ${limit} CV${limit === 1 ? "" : "s"} on the ${plan} plan.`);
		this.limit = limit;
		this.plan = plan;
	}
};
async function getUserPlan(supabase, userId) {
	const { data, error } = await supabase.from("profiles").select("plan").eq("id", userId).maybeSingle();
	if (error) throw new Error(`Could not resolve plan: ${error.message}`);
	return data?.plan === "paid" ? "paid" : "free";
}
function windowStart(window) {
	const d = /* @__PURE__ */ new Date();
	if (window === "day") d.setUTCHours(0, 0, 0, 0);
	else d.setUTCDate(d.getUTCDate() - 7);
	return d.toISOString();
}
/**
* Throws LimitReachedError if the user has hit their plan limit for this task.
* Returns the resolved plan so callers can reuse it.
*/
async function enforceAiLimit(supabase, userId, task) {
	const plan = await getUserPlan(supabase, userId);
	const limits = getPlanLimits(plan);
	let limit;
	let window;
	switch (task) {
		case "match_score":
			limit = limits.matchScorePerDay;
			window = "day";
			break;
		case "keywords":
			limit = limits.keywordsPerDay;
			window = "day";
			break;
		case "cover_letter":
			if (limits.coverLetterPerDay != null) {
				limit = limits.coverLetterPerDay;
				window = "day";
			} else {
				limit = limits.coverLetterPerWeek;
				window = "week";
			}
			break;
	}
	if (limit == null) return plan;
	const { count, error } = await supabase.from("usage_logs").select("id", {
		count: "exact",
		head: true
	}).eq("user_id", userId).eq("task_type", task).gte("created_at", windowStart(window));
	if (error) throw new Error(error.message);
	if ((count ?? 0) >= limit) throw new LimitReachedError(task, limit, window, plan);
	return plan;
}
async function logUsage(supabase, userId, task) {
	const { error } = await supabase.from("usage_logs").insert({
		user_id: userId,
		task_type: task
	});
	if (error) logNonFatal("usage.logUsage", /* @__PURE__ */ new Error(`${task} for ${userId}: ${error.message}`));
}
async function enforceCvLimit(supabase, userId) {
	const plan = await getUserPlan(supabase, userId);
	const limit = getPlanLimits(plan).cvProfiles;
	if (limit == null) return;
	const { count, error } = await supabase.from("cvs").select("id", {
		count: "exact",
		head: true
	}).eq("user_id", userId);
	if (error) throw new Error(error.message);
	if ((count ?? 0) >= limit) throw new CvLimitReachedError(limit, plan);
}
//#endregion
export { CvLimitReachedError, LimitReachedError, enforceAiLimit, enforceCvLimit, logUsage };
