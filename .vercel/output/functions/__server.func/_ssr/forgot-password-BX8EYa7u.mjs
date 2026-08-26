import { o as __toESM } from "../_runtime.mjs";
import { _ as useRouter } from "../_libs/@tanstack/react-router+[...].mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { P as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as Button } from "./button-Dts1Y2ez.mjs";
import { t as Input } from "./input-B2ae_v7j.mjs";
import { t as Label } from "./label-atB1Bfyt.mjs";
import { a as CardTitle, i as CardHeader, n as CardContent, r as CardDescription, t as Card } from "./card-Cyf-osIi.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as supabase } from "./client-C1nPdEEu.mjs";
import { t as ApplyPilotLogo } from "./ApplyPilotLogo-BD61uhC_.mjs";
import { n as describeAuthError } from "./auth-errors-CwlWn7HY.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/forgot-password-BX8EYa7u.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ForgotPassword() {
	const router = useRouter();
	const [email, setEmail] = (0, import_react.useState)("");
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [sent, setSent] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)(null);
	const [cooldown, setCooldown] = (0, import_react.useState)(0);
	(0, import_react.useEffect)(() => {
		if (cooldown <= 0) return;
		const t = setTimeout(() => setCooldown((c) => c - 1), 1e3);
		return () => clearTimeout(t);
	}, [cooldown]);
	const submit = async (e) => {
		e.preventDefault();
		setError(null);
		setBusy(true);
		try {
			const { error: err } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: `${window.location.origin}/reset-password` });
			if (err) throw err;
			setSent(true);
			setCooldown(60);
			toast.success("Password reset email sent");
		} catch (err) {
			const info = describeAuthError(err);
			setError(info.message);
			if (info.retryAfter) setCooldown(info.retryAfter);
			toast.error(info.message);
		} finally {
			setBusy(false);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
			className: "w-full max-w-md",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
				className: "text-center",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ApplyPilotLogo, {
						className: "mb-2 justify-center",
						markClassName: "h-9 w-9"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
						className: "font-serif text-2xl",
						children: sent ? "Check your email" : "Reset your password"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: sent ? `We sent a reset link to ${email}. Open it to choose a new password — it expires in about an hour.` : "Enter the email you signed up with and we'll send you a reset link." })
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
				className: "space-y-4",
				children: [
					!sent && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						onSubmit: submit,
						className: "space-y-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "reset-email",
									children: "Email"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "reset-email",
									type: "email",
									autoComplete: "email",
									value: email,
									onChange: (e) => setEmail(e.target.value),
									required: true
								})]
							}),
							error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								role: "alert",
								className: "text-sm text-destructive",
								children: error
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "submit",
								className: "w-full",
								disabled: busy || cooldown > 0,
								children: busy ? "Sending…" : cooldown > 0 ? `Try again in ${cooldown}s` : "Send reset link"
							})
						]
					}),
					sent && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						className: "w-full",
						disabled: busy || cooldown > 0,
						onClick: submit,
						children: cooldown > 0 ? `Resend in ${cooldown}s` : "Resend reset link"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "w-full text-center text-sm text-muted-foreground hover:text-foreground",
						onClick: () => router.navigate({ to: "/auth" }),
						children: "Back to sign in"
					})
				]
			})]
		})
	});
}
//#endregion
export { ForgotPassword as component };
