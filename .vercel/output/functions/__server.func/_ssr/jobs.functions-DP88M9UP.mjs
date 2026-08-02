import { c as createServerFn } from "./createServerFn-BFFE07zL.mjs";
import { t as requireSupabaseAuth } from "./auth-middleware-7KFL4zEp.mjs";
import { a as preprocessType, i as objectType, n as enumType, o as stringType, t as arrayType } from "../_libs/zod.mjs";
import { t as createServerRpc } from "./createServerRpc-MBa5GZ-L.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/jobs.functions-DP88M9UP.js
var jobStatus = enumType([
	"saved",
	"applied",
	"interview",
	"offer",
	"rejected"
]);
var jobInputSchema = objectType({
	company: stringType().min(1).max(200),
	title: stringType().min(1).max(200),
	status: jobStatus.default("saved"),
	notes: stringType().max(1e4).optional().nullable(),
	url: preprocessType((v) => {
		if (typeof v !== "string") return v;
		const t = v.trim();
		if (!t) return null;
		return /^https?:\/\//i.test(t) ? t : `https://${t}`;
	}, stringType().url().max(2e3).nullable().optional()),
	job_description: stringType().max(5e4).optional().nullable(),
	deadline: stringType().optional().nullable(),
	language: stringType().max(50).optional().nullable(),
	country: stringType().max(50).optional().nullable(),
	source: stringType().max(50).optional().nullable(),
	source_id: stringType().max(200).optional().nullable(),
	cv_id: stringType().uuid().nullable().optional()
});
var listJobs_createServerFn_handler = createServerRpc({
	id: "0f6b44b459f0f5a7154aecdbd6de5f39fc93825d0d32caf19f26936089e5a107",
	name: "listJobs",
	filename: "src/lib/jobs.functions.ts"
}, (opts) => listJobs.__executeServer(opts));
var listJobs = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(listJobs_createServerFn_handler, async ({ context }) => {
	const { data, error } = await context.supabase.from("jobs").select("*").order("created_at", { ascending: false });
	if (error) throw new Error(error.message);
	return data ?? [];
});
var getJob_createServerFn_handler = createServerRpc({
	id: "432b934c493a65b20930541aa425464f2c52d0a8716794775211fc250ec5a8e5",
	name: "getJob",
	filename: "src/lib/jobs.functions.ts"
}, (opts) => getJob.__executeServer(opts));
var getJob = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({ id: stringType().uuid() }).parse(d)).handler(getJob_createServerFn_handler, async ({ data, context }) => {
	const { data: job, error } = await context.supabase.from("jobs").select("*").eq("id", data.id).maybeSingle();
	if (error) throw new Error(error.message);
	return job;
});
var createJob_createServerFn_handler = createServerRpc({
	id: "ab0e7c09b47d7ada2f8e5674d2a34621a0be302c11db7c58ae029c8e93152a4c",
	name: "createJob",
	filename: "src/lib/jobs.functions.ts"
}, (opts) => createJob.__executeServer(opts));
var createJob = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((d) => jobInputSchema.parse(d)).handler(createJob_createServerFn_handler, async ({ data, context }) => {
	const { data: row, error } = await context.supabase.from("jobs").insert({
		...data,
		user_id: context.userId
	}).select().single();
	if (error) throw new Error(error.message);
	return row;
});
var updateJob_createServerFn_handler = createServerRpc({
	id: "b04a7dd5fe6d3ab53e9a31603660271b9c3b5510d7c6be92f02f78bf5e625c8c",
	name: "updateJob",
	filename: "src/lib/jobs.functions.ts"
}, (opts) => updateJob.__executeServer(opts));
var updateJob = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
	id: stringType().uuid(),
	patch: jobInputSchema.partial()
}).parse(d)).handler(updateJob_createServerFn_handler, async ({ data, context }) => {
	const { data: row, error } = await context.supabase.from("jobs").update(data.patch).eq("id", data.id).select().single();
	if (error) throw new Error(error.message);
	return row;
});
var deleteJob_createServerFn_handler = createServerRpc({
	id: "0b6eaaf0affa05d8406d489ac99eda00e3421778cab940e69680df0823f93f94",
	name: "deleteJob",
	filename: "src/lib/jobs.functions.ts"
}, (opts) => deleteJob.__executeServer(opts));
var deleteJob = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({ id: stringType().uuid() }).parse(d)).handler(deleteJob_createServerFn_handler, async ({ data, context }) => {
	const { error } = await context.supabase.from("jobs").delete().eq("id", data.id);
	if (error) throw new Error(error.message);
	return { ok: true };
});
var deleteJobs_createServerFn_handler = createServerRpc({
	id: "7abb1d2f3118c756ff32d2392b98c7011b60faeff53a08e854bcf983892ac3e3",
	name: "deleteJobs",
	filename: "src/lib/jobs.functions.ts"
}, (opts) => deleteJobs.__executeServer(opts));
var deleteJobs = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({ ids: arrayType(stringType().uuid()).min(1).max(500) }).parse(d)).handler(deleteJobs_createServerFn_handler, async ({ data, context }) => {
	const { error } = await context.supabase.from("jobs").delete().in("id", data.ids);
	if (error) throw new Error(error.message);
	return {
		ok: true,
		count: data.ids.length
	};
});
var updateJobsStatus_createServerFn_handler = createServerRpc({
	id: "7bd270fb138166e4d0abe98cb0ce1ad0ec90c8a4a876cdd9ed9581c3d8a0109d",
	name: "updateJobsStatus",
	filename: "src/lib/jobs.functions.ts"
}, (opts) => updateJobsStatus.__executeServer(opts));
var updateJobsStatus = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
	ids: arrayType(stringType().uuid()).min(1).max(500),
	status: jobStatus
}).parse(d)).handler(updateJobsStatus_createServerFn_handler, async ({ data, context }) => {
	const { error } = await context.supabase.from("jobs").update({ status: data.status }).in("id", data.ids);
	if (error) throw new Error(error.message);
	return {
		ok: true,
		count: data.ids.length,
		status: data.status
	};
});
//#endregion
export { createJob_createServerFn_handler, deleteJob_createServerFn_handler, deleteJobs_createServerFn_handler, getJob_createServerFn_handler, listJobs_createServerFn_handler, updateJob_createServerFn_handler, updateJobsStatus_createServerFn_handler };
