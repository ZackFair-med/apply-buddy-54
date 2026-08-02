import { o as __toESM } from "../_runtime.mjs";
import { _ as useRouter } from "../_libs/@tanstack/react-router+[...].mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { I as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as Button } from "./button-PwNqyxv_.mjs";
import { a as CardTitle, i as CardHeader, n as CardContent, r as CardDescription, t as Card } from "./card-C5Nmk_bj.mjs";
import { r as readAuthLinkFromUrl, t as completeAuthCallback } from "./auth-link-FLqotxOI.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/auth.callback-dAuRFX4d.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/** Auth errors arrive either in the query string or in the URL hash. */
function readLinkError() {
	if (typeof window === "undefined") return null;
	const query = new URLSearchParams(window.location.search);
	const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
	const get = (key) => query.get(key) ?? hash.get(key);
	const code = get("error_code");
	const raw = get("error_description")?.replace(/\+/g, " ");
	const error = get("error");
	if (!code && !raw && !error) return null;
	if (code === "otp_expired") return "This link has expired. Request a new confirmation or reset email and open it right away.";
	if (error === "access_denied") return "This link is no longer valid — it may already have been used. Request a new one.";
	return raw || error || "This link could not be verified.";
}
function AuthCallback() {
	const router = useRouter();
	const [error, setError] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		const linkError = readLinkError();
		if (linkError) {
			setError(linkError);
			return;
		}
		let cancelled = false;
		const finish = async () => {
			const { type } = readAuthLinkFromUrl();
			const result = await completeAuthCallback();
			if (cancelled) return;
			if (!result.ok) {
				setError(result.error);
				return;
			}
			router.navigate({ to: type === "recovery" ? "/reset-password" : "/" });
		};
		finish().catch((e) => {
			if (!cancelled) setError(e instanceof Error ? e.message : "Sign-in could not be completed.");
		});
		return () => {
			cancelled = true;
		};
	}, [router]);
	if (error) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
			className: "w-full max-w-md",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
				className: "text-center",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
					className: "font-serif text-2xl",
					children: "Sign-in link problem"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: error })]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				className: "w-full",
				onClick: () => router.navigate({ to: "/auth" }),
				children: "Back to sign in"
			}) })]
		})
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm text-muted-foreground",
			children: "Signing you in…"
		})
	});
}
//#endregion
export { AuthCallback as component };
