import { c as createServerFn } from "./createServerFn-BFFE07zL.mjs";
import { t as requireSupabaseAuth } from "./auth-middleware-7KFL4zEp.mjs";
import { t as createServerRpc } from "./createServerRpc-MBa5GZ-L.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/history.functions-CNjhcySF.js
var listMatchHistory_createServerFn_handler = createServerRpc({
	id: "a9a60f4ab318fbfaeb24adc4dddd7ada313bd53fc3ee25029c7aa5552b742d64",
	name: "listMatchHistory",
	filename: "src/lib/history.functions.ts"
}, (opts) => listMatchHistory.__executeServer(opts));
var listMatchHistory = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(listMatchHistory_createServerFn_handler, async ({ context }) => {
	const { supabase, userId } = context;
	const { data: profile, error: profileError } = await supabase.from("profiles").select("plan").eq("id", userId).maybeSingle();
	if (profileError) throw new Error(`Could not read plan: ${profileError.message}`);
	if (!(profile?.plan === "paid")) return {
		paid: false,
		items: []
	};
	const { data, error } = await supabase.from("match_history").select("id, cv_id, job_id, job_title, company, match_score, strengths, weaknesses, created_at, cvs(label)").eq("user_id", userId).order("created_at", { ascending: false }).limit(500);
	if (error) throw new Error(error.message);
	return {
		paid: true,
		items: (data ?? []).map((r) => ({
			id: r.id,
			cv_id: r.cv_id,
			job_id: r.job_id,
			job_title: r.job_title,
			company: r.company,
			match_score: r.match_score,
			strengths: r.strengths ?? [],
			weaknesses: r.weaknesses ?? [],
			created_at: r.created_at,
			cv_label: r.cvs?.label ?? null
		}))
	};
});
//#endregion
export { listMatchHistory_createServerFn_handler };
