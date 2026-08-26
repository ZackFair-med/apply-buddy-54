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
import { t as authErrorMessage } from "./auth-errors-CwlWn7HY.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/reset-password-BLPCHU8t.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ResetPassword() {
	const router = useRouter();
	const [ready, setReady] = (0, import_react.useState)(false);
	const [password, setPassword] = (0, import_react.useState)("");
	const [confirm, setConfirm] = (0, import_react.useState)("");
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		let cancelled = false;
		const check = async () => {
			for (let i = 0; i < 20 && !cancelled; i++) {
				const { data } = await supabase.auth.getSession();
				if (data.session) {
					setReady(true);
					return;
				}
				await new Promise((r) => setTimeout(r, 150));
			}
			if (!cancelled) setError("This reset link is invalid or has expired. Request a new one.");
		};
		check();
		return () => {
			cancelled = true;
		};
	}, []);
	const submit = async (e) => {
		e.preventDefault();
		setError(null);
		if (password.length < 6) {
			setError("Password must be at least 6 characters.");
			return;
		}
		if (password !== confirm) {
			setError("Passwords don't match.");
			return;
		}
		setBusy(true);
		try {
			const { error: err } = await supabase.auth.updateUser({ password });
			if (err) throw err;
			toast.success("Password updated");
			router.navigate({ to: "/" });
		} catch (err) {
			const msg = authErrorMessage(err);
			setError(msg);
			toast.error(msg);
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
						children: "Set a new password"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Choose a password you haven't used before." })
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
				className: "space-y-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						onSubmit: submit,
						className: "space-y-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "new-password",
									children: "New password"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "new-password",
									type: "password",
									autoComplete: "new-password",
									value: password,
									onChange: (e) => setPassword(e.target.value),
									required: true,
									minLength: 6
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "confirm-password",
									children: "Confirm password"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "confirm-password",
									type: "password",
									autoComplete: "new-password",
									value: confirm,
									onChange: (e) => setConfirm(e.target.value),
									required: true,
									minLength: 6
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
								disabled: busy || !ready,
								children: busy ? "Updating…" : "Update password"
							})
						]
					}),
					!ready && error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						className: "w-full",
						onClick: () => router.navigate({ to: "/forgot-password" }),
						children: "Request a new reset link"
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
export { ResetPassword as component };
