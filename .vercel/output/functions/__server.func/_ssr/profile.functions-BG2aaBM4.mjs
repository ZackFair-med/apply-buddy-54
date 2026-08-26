import { l as createServerFn } from "./esm-9EjmF9OT.mjs";
import { t as createSsrRpc } from "./createSsrRpc-C19MdsU6.mjs";
import { t as requireSupabaseAuth } from "./auth-middleware-B3XILrvZ.mjs";
import { i as objectType, o as stringType, r as numberType } from "../_libs/zod.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/profile.functions-BG2aaBM4.js
var getProfile = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(createSsrRpc("9df9652da79c7ccc337ce62c64dcd11f1800a8eb6e0bd13747650358f67fe4e8"));
var updateSchema = objectType({
	first_name: stringType().trim().max(100).nullable().optional(),
	last_name: stringType().trim().max(100).nullable().optional(),
	display_name: stringType().trim().max(200).nullable().optional(),
	target_title: stringType().trim().max(200).nullable().optional(),
	target_date: stringType().nullable().optional(),
	target_salary_min: numberType().int().min(0).max(1e7).nullable().optional(),
	target_salary_max: numberType().int().min(0).max(1e7).nullable().optional(),
	target_salary_currency: stringType().trim().max(10).nullable().optional(),
	weekly_goal: numberType().int().min(1).max(100).nullable().optional()
});
var updateProfile = createServerFn({ method: "POST" }).validator((d) => updateSchema.parse(d)).middleware([requireSupabaseAuth]).handler(createSsrRpc("d94d0b5402d88327ffc5615e3b5d2a6f5e7a519b2121a922cbe6da824cc59c6d"));
var deleteAccount = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).handler(createSsrRpc("e3724759230797f56a37af0d23e62140c27061011da5cab9dfb38b59e284a950"));
//#endregion
export { getProfile as n, updateProfile as r, deleteAccount as t };
