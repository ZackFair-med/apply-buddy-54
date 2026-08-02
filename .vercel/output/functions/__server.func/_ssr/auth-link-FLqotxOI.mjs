import { t as supabase } from "./client-C6ZaJElq.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/auth-link-FLqotxOI.js
function readAuthLinkFromUrl() {
	if (typeof window === "undefined") return {
		type: null,
		hasTokens: false,
		tokenHash: null,
		code: null
	};
	const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
	const query = new URLSearchParams(window.location.search);
	const type = hash.get("type") ?? query.get("type");
	const tokenHash = query.get("token_hash");
	const code = query.get("code");
	return {
		type,
		hasTokens: hash.has("access_token") || hash.has("refresh_token") || !!tokenHash || !!code,
		tokenHash,
		code
	};
}
async function waitForSupabaseSession(maxAttempts = 20) {
	for (let i = 0; i < maxAttempts; i++) {
		const { data } = await supabase.auth.getSession();
		if (data.session) return true;
		await new Promise((r) => setTimeout(r, 150));
	}
	return false;
}
function cleanAuthParamsFromUrl() {
	if (typeof window === "undefined") return;
	window.history.replaceState(null, "", window.location.pathname);
}
async function establishSessionFromUrl(code, tokenHash, type) {
	if (tokenHash && type) {
		const { error } = await supabase.auth.verifyOtp({
			token_hash: tokenHash,
			type
		});
		if (error) return false;
	}
	if (code) {
		const { error } = await supabase.auth.exchangeCodeForSession(code);
		if (error) return false;
		return true;
	}
	return waitForSupabaseSession();
}
/**
* Finish an OAuth/email callback on `/auth/callback` (PKCE code or hash tokens).
*/
async function completeAuthCallback() {
	const { type, hasTokens, tokenHash, code } = readAuthLinkFromUrl();
	if (!hasTokens) {
		if (await waitForSupabaseSession()) {
			cleanAuthParamsFromUrl();
			return { ok: true };
		}
		return {
			ok: false,
			error: "No sign-in credentials were found in this link."
		};
	}
	if (!await establishSessionFromUrl(code, tokenHash, type)) return {
		ok: false,
		error: "We couldn't complete the sign-in. The link may have expired, or this site's URL isn't allow-listed in your auth redirect settings."
	};
	cleanAuthParamsFromUrl();
	return { ok: true };
}
/**
* Consume Supabase auth tokens from the current URL (hash, PKCE code, or
* token_hash) and return where the user should go next. Returns null when the
* URL has no auth tokens left to process.
*
* Skips `/auth/callback` so Google/OAuth PKCE can finish there without the
* root route stripping the `code` param early.
*/
async function processAuthLinkFromUrl() {
	const { type, hasTokens, tokenHash, code } = readAuthLinkFromUrl();
	if (!hasTokens) return null;
	if (typeof window !== "undefined" && window.location.pathname === "/auth/callback") return null;
	if (!await establishSessionFromUrl(code, tokenHash, type)) return null;
	cleanAuthParamsFromUrl();
	if (type === "recovery") return "/reset-password";
	if (type === "signup" || type === "invite" || type === "email") return "/auth/callback";
	return "/";
}
//#endregion
export { waitForSupabaseSession as i, processAuthLinkFromUrl as n, readAuthLinkFromUrl as r, completeAuthCallback as t };
