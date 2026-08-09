import { l as createServerFn } from "./esm-9EjmF9OT.mjs";
import { t as requireSupabaseAuth } from "./auth-middleware-B3XILrvZ.mjs";
import { i as objectType, o as stringType, r as numberType } from "../_libs/zod.mjs";
import { t as createServerRpc } from "./createServerRpc-TAUNrjZd.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/profile.functions-D7ALAovg.js
var getProfile_createServerFn_handler = createServerRpc({
	id: "9df9652da79c7ccc337ce62c64dcd11f1800a8eb6e0bd13747650358f67fe4e8",
	name: "getProfile",
	filename: "src/lib/profile.functions.ts"
}, (opts) => getProfile.__executeServer(opts));
var getProfile = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(getProfile_createServerFn_handler, async ({ context }) => {
	const { data, error } = await context.supabase.from("profiles").select("*").eq("id", context.userId).maybeSingle();
	if (error) throw new Error(error.message);
	return data;
});
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
var updateProfile_createServerFn_handler = createServerRpc({
	id: "d94d0b5402d88327ffc5615e3b5d2a6f5e7a519b2121a922cbe6da824cc59c6d",
	name: "updateProfile",
	filename: "src/lib/profile.functions.ts"
}, (opts) => updateProfile.__executeServer(opts));
var updateProfile = createServerFn({ method: "POST" }).validator((d) => updateSchema.parse(d)).middleware([requireSupabaseAuth]).handler(updateProfile_createServerFn_handler, async ({ data, context }) => {
	const patch = {};
	for (const [k, v] of Object.entries(data)) {
		if (v === void 0) continue;
		patch[k] = typeof v === "string" ? v.length ? v : null : v;
	}
	const { data: row, error } = await context.supabase.from("profiles").update(patch).eq("id", context.userId).select().single();
	if (error) throw new Error(error.message);
	return row;
});
var deleteAccount_createServerFn_handler = createServerRpc({
	id: "e3724759230797f56a37af0d23e62140c27061011da5cab9dfb38b59e284a950",
	name: "deleteAccount",
	filename: "src/lib/profile.functions.ts"
}, (opts) => deleteAccount.__executeServer(opts));
var deleteAccount = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).handler(deleteAccount_createServerFn_handler, async ({ context }) => {
	const { supabaseAdmin } = await import("./client.server-Bw6iWMJ-.mjs");
	const { error } = await supabaseAdmin.auth.admin.deleteUser(context.userId);
	if (error) throw new Error(error.message);
	return { ok: true };
});
//#endregion
export { deleteAccount_createServerFn_handler, getProfile_createServerFn_handler, updateProfile_createServerFn_handler };
