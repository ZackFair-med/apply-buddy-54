import { c as createServerFn } from "./createServerFn-BFFE07zL.mjs";
import { t as createSsrRpc } from "./createSsrRpc-BfwDcJiR.mjs";
import { t as requireSupabaseAuth } from "./auth-middleware-7KFL4zEp.mjs";
import { a as preprocessType, i as objectType, n as enumType, o as stringType, t as arrayType } from "../_libs/zod.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/jobs.functions-By641M3M.js
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
var listJobs = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(createSsrRpc("0f6b44b459f0f5a7154aecdbd6de5f39fc93825d0d32caf19f26936089e5a107"));
createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({ id: stringType().uuid() }).parse(d)).handler(createSsrRpc("432b934c493a65b20930541aa425464f2c52d0a8716794775211fc250ec5a8e5"));
var createJob = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((d) => jobInputSchema.parse(d)).handler(createSsrRpc("ab0e7c09b47d7ada2f8e5674d2a34621a0be302c11db7c58ae029c8e93152a4c"));
var updateJob = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
	id: stringType().uuid(),
	patch: jobInputSchema.partial()
}).parse(d)).handler(createSsrRpc("b04a7dd5fe6d3ab53e9a31603660271b9c3b5510d7c6be92f02f78bf5e625c8c"));
var deleteJob = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({ id: stringType().uuid() }).parse(d)).handler(createSsrRpc("0b6eaaf0affa05d8406d489ac99eda00e3421778cab940e69680df0823f93f94"));
var deleteJobs = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({ ids: arrayType(stringType().uuid()).min(1).max(500) }).parse(d)).handler(createSsrRpc("7abb1d2f3118c756ff32d2392b98c7011b60faeff53a08e854bcf983892ac3e3"));
var updateJobsStatus = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
	ids: arrayType(stringType().uuid()).min(1).max(500),
	status: jobStatus
}).parse(d)).handler(createSsrRpc("7bd270fb138166e4d0abe98cb0ce1ad0ec90c8a4a876cdd9ed9581c3d8a0109d"));
//#endregion
export { updateJob as a, listJobs as i, deleteJob as n, updateJobsStatus as o, deleteJobs as r, createJob as t };
