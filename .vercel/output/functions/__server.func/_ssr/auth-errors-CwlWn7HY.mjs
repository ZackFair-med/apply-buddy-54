//#region node_modules/.nitro/vite/services/ssr/assets/auth-errors-CwlWn7HY.js
function seconds(raw) {
	const m = raw.match(/(\d+)\s*second/i);
	return m ? Number(m[1]) : void 0;
}
function describeAuthError(error) {
	const raw = error instanceof Error ? error.message : typeof error === "string" ? error : String(error);
	const m = raw.toLowerCase();
	if (m.includes("email rate limit exceeded") || m.includes("over_email_send_rate_limit")) return {
		kind: "rate_limit",
		message: "Too many confirmation emails have been sent from this project in the last hour. Wait a few minutes and try again — or sign in if your account is already confirmed."
	};
	if (m.includes("only request this after") || m.includes("too many requests") || m.includes("429")) return {
		kind: "cooldown",
		retryAfter: seconds(raw),
		message: seconds(raw) ? `Please wait ${seconds(raw)} seconds before trying again.` : "Too many attempts. Wait a moment and try again."
	};
	if (m.includes("invalid login credentials")) return {
		kind: "credentials",
		message: "Email or password is incorrect."
	};
	if (m.includes("email not confirmed")) return {
		kind: "unconfirmed",
		message: "Confirm your email first — check your inbox for the confirmation link."
	};
	if (m.includes("already registered") || m.includes("already been registered") || m.includes("user_already_exists")) return {
		kind: "already_registered",
		message: "That email already has an account. Sign in instead, or reset your password."
	};
	if (m.includes("password should be") || m.includes("weak") || m.includes("pwned") || m.includes("compromised")) return {
		kind: "weak_password",
		message: raw.includes("pwned") ? "That password has appeared in a known data breach. Choose a different one." : "Password is too weak — use at least 6 characters with a mix of letters and numbers."
	};
	if (m.includes("expired") || m.includes("otp_expired") || m.includes("token has expired")) return {
		kind: "expired_link",
		message: "This link has expired. Request a new one and open it right away."
	};
	if (m.includes("missing supabase environment")) return {
		kind: "config",
		message: "The app is missing its backend configuration. Check the environment variables on your deployment."
	};
	if (m.includes("unsupported provider")) return {
		kind: "config",
		message: "Google sign-in isn't enabled on this project yet."
	};
	if (m.includes("failed to fetch") || m.includes("networkerror") || m.includes("load failed")) return {
		kind: "network",
		message: "Could not reach the backend. Check your connection and the backend URL / key."
	};
	return {
		kind: "unknown",
		message: raw || "Something went wrong. Please try again."
	};
}
function authErrorMessage(error) {
	return describeAuthError(error).message;
}
//#endregion
export { describeAuthError as n, authErrorMessage as t };
