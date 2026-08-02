import { o as __toESM } from "../_runtime.mjs";
import { _ as useRouter } from "../_libs/@tanstack/react-router+[...].mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { I as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as Button } from "./button-PwNqyxv_.mjs";
import { t as Input } from "./input-uzm9g8Y7.mjs";
import { t as Label } from "./label-BeT0bXvu.mjs";
import { a as CardTitle, i as CardHeader, n as CardContent, r as CardDescription, t as Card } from "./card-C5Nmk_bj.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as supabase } from "./client-C6ZaJElq.mjs";
import { n as processAuthLinkFromUrl, r as readAuthLinkFromUrl } from "./auth-link-FLqotxOI.mjs";
import { n as describeAuthError } from "./auth-errors-CwlWn7HY.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/auth-U5iXXTDm.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function AuthPage() {
	const router = useRouter();
	const [mode, setMode] = (0, import_react.useState)("signin");
	const [firstName, setFirstName] = (0, import_react.useState)("");
	const [lastName, setLastName] = (0, import_react.useState)("");
	const [email, setEmail] = (0, import_react.useState)("");
	const [password, setPassword] = (0, import_react.useState)("");
	const [confirmPassword, setConfirmPassword] = (0, import_react.useState)("");
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)(null);
	const [notice, setNotice] = (0, import_react.useState)(null);
	const [sent, setSent] = (0, import_react.useState)(false);
	const [cooldown, setCooldown] = (0, import_react.useState)(0);
	(0, import_react.useEffect)(() => {
		const probe = async () => {
			const target = await processAuthLinkFromUrl();
			if (target) {
				router.navigate({ to: target });
				return;
			}
			const { type } = readAuthLinkFromUrl();
			const { data } = await supabase.auth.getUser();
			if (data.user) router.navigate({ to: type === "recovery" ? "/reset-password" : "/" });
		};
		probe().catch((e) => console.error("[auth] session probe failed:", e));
	}, [router]);
	(0, import_react.useEffect)(() => {
		if (cooldown <= 0) return;
		const t = setTimeout(() => setCooldown((c) => c - 1), 1e3);
		return () => clearTimeout(t);
	}, [cooldown]);
	const fail = (err) => {
		const info = describeAuthError(err);
		setError(info.message);
		if (info.retryAfter) setCooldown(info.retryAfter);
		if (info.kind === "rate_limit") setCooldown(60);
		toast.error(info.message);
		return info;
	};
	const switchMode = (next) => {
		setMode(next);
		setError(null);
		setNotice(null);
		setSent(false);
		setPassword("");
		setConfirmPassword("");
	};
	const submit = async (e) => {
		e.preventDefault();
		setError(null);
		setNotice(null);
		if (mode === "signup") {
			if (password.length < 6) {
				setError("Password must be at least 6 characters.");
				return;
			}
			if (password !== confirmPassword) {
				setError("Passwords don't match.");
				return;
			}
		}
		setBusy(true);
		try {
			if (mode === "signup") {
				const display = [firstName.trim(), lastName.trim()].filter(Boolean).join(" ");
				const { data, error: err } = await supabase.auth.signUp({
					email: email.trim(),
					password,
					options: {
						emailRedirectTo: `${window.location.origin}/auth/callback`,
						data: {
							first_name: firstName.trim() || null,
							last_name: lastName.trim() || null,
							display_name: display || null
						}
					}
				});
				if (err) throw err;
				if (data.session) {
					toast.success("Account created");
					router.navigate({ to: "/" });
					return;
				}
				if (data.user && data.user.identities?.length === 0) {
					setError("That email already has an account. Sign in instead, or reset your password.");
					return;
				}
				setSent(true);
				setCooldown(60);
				toast.success("Confirmation email sent");
			} else {
				const { error: err } = await supabase.auth.signInWithPassword({
					email: email.trim(),
					password
				});
				if (err) throw err;
				toast.success("Welcome back");
				router.navigate({ to: "/" });
			}
		} catch (err) {
			if (fail(err).kind === "unconfirmed") setSent(true);
		} finally {
			setBusy(false);
		}
	};
	const resendConfirmation = async () => {
		setBusy(true);
		setError(null);
		setNotice(null);
		try {
			const { error: err } = await supabase.auth.resend({
				type: "signup",
				email: email.trim(),
				options: { emailRedirectTo: `${window.location.origin}/auth/callback` }
			});
			if (err) throw err;
			setCooldown(60);
			setNotice("Confirmation email sent again.");
			toast.success("Confirmation email sent");
		} catch (err) {
			fail(err);
		} finally {
			setBusy(false);
		}
	};
	const google = async () => {
		setBusy(true);
		setError(null);
		const { error: err } = await supabase.auth.signInWithOAuth({
			provider: "google",
			options: { redirectTo: `${window.location.origin}/auth/callback` }
		});
		if (err) {
			fail(err);
			setBusy(false);
		}
	};
	if (sent) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
			className: "w-full max-w-md",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
				className: "text-center",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
					className: "font-serif text-2xl",
					children: "Confirm your email"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardDescription, { children: [
					"We sent a confirmation link to ",
					email || "your inbox",
					". Open it to activate your account, then sign in. Check your spam folder if it hasn't arrived in a few minutes."
				] })]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
				className: "space-y-3",
				children: [
					error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						role: "alert",
						className: "text-sm text-destructive",
						children: error
					}),
					notice && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted-foreground",
						children: notice
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						className: "w-full",
						onClick: resendConfirmation,
						disabled: busy || cooldown > 0 || !email.trim(),
						children: cooldown > 0 ? `Resend in ${cooldown}s` : "Resend confirmation email"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						className: "w-full",
						onClick: () => switchMode("signin"),
						children: "Back to sign in"
					})
				]
			})]
		})
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
			className: "w-full max-w-md",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
				className: "text-center",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
					className: "font-serif text-2xl",
					children: mode === "signup" ? "Create your account" : "Welcome back"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: mode === "signup" ? "Start tracking jobs and tailoring CVs in minutes." : "Sign in to continue to ApplyPilot." })]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
				className: "space-y-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid grid-cols-2 gap-1 rounded-lg border border-border p-1",
						children: ["signin", "signup"].map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => switchMode(m),
							className: `rounded-md px-3 py-1.5 text-sm transition-colors ${mode === m ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`,
							children: m === "signin" ? "Sign in" : "Sign up"
						}, m))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						className: "w-full",
						onClick: google,
						disabled: busy,
						children: "Continue with Google"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative text-center text-xs text-muted-foreground",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "bg-card px-2 relative z-10",
							children: "or"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-x-0 top-1/2 -z-0 h-px bg-border" })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						onSubmit: submit,
						className: "space-y-3",
						children: [
							mode === "signup" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid grid-cols-2 gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										htmlFor: "firstName",
										children: "First name"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										id: "firstName",
										autoComplete: "given-name",
										value: firstName,
										onChange: (e) => setFirstName(e.target.value),
										required: true
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										htmlFor: "lastName",
										children: "Last name"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										id: "lastName",
										autoComplete: "family-name",
										value: lastName,
										onChange: (e) => setLastName(e.target.value)
									})]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "email",
									children: "Email"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "email",
									type: "email",
									autoComplete: "email",
									value: email,
									onChange: (e) => setEmail(e.target.value),
									required: true
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										htmlFor: "password",
										children: "Password"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										id: "password",
										type: "password",
										autoComplete: mode === "signup" ? "new-password" : "current-password",
										value: password,
										onChange: (e) => setPassword(e.target.value),
										required: true,
										minLength: 6
									}),
									mode === "signup" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs text-muted-foreground",
										children: "At least 6 characters."
									})
								]
							}),
							mode === "signup" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "confirmPassword",
									children: "Confirm password"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "confirmPassword",
									type: "password",
									autoComplete: "new-password",
									value: confirmPassword,
									onChange: (e) => setConfirmPassword(e.target.value),
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
								disabled: busy || cooldown > 0,
								children: busy ? "Please wait…" : cooldown > 0 ? `Try again in ${cooldown}s` : mode === "signup" ? "Create account" : "Sign in"
							})
						]
					}),
					mode === "signin" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "w-full text-center text-sm text-muted-foreground hover:text-foreground",
						onClick: () => router.navigate({ to: "/forgot-password" }),
						children: "Forgot your password?"
					})
				]
			})]
		})
	});
}
//#endregion
export { AuthPage as component };
