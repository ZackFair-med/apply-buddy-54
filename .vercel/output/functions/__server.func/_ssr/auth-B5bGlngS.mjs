import { o as __toESM } from "../_runtime.mjs";
import { _ as useRouter } from "../_libs/@tanstack/react-router+[...].mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { P as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as Button } from "./button-Dts1Y2ez.mjs";
import { t as Input } from "./input-B2ae_v7j.mjs";
import { t as Label } from "./label-atB1Bfyt.mjs";
import { a as CardTitle, i as CardHeader, n as CardContent, r as CardDescription, t as Card } from "./card-Cyf-osIi.mjs";
import { g as Gauge, j as ArrowRight, p as ListTodo, u as MailCheck, v as FilePenLine } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as supabase } from "./client-C1nPdEEu.mjs";
import { n as processAuthLinkFromUrl, r as readAuthLinkFromUrl } from "./auth-link-DBxvJQmx.mjs";
import { t as ApplyPilotLogo } from "./ApplyPilotLogo-BD61uhC_.mjs";
import { n as describeAuthError } from "./auth-errors-CwlWn7HY.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/auth-B5bGlngS.js
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
	const [showAuth, setShowAuth] = (0, import_react.useState)(false);
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
	const openAuth = (next) => {
		switchMode(next);
		setShowAuth(true);
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
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "w-full max-w-md space-y-6",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-center",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ApplyPilotLogo, { markClassName: "h-9 w-9" })
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
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
			})] })]
		})
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen bg-background text-foreground",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
				className: "sticky top-0 z-40 border-b border-border/70 bg-background/95",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto flex h-[4.5rem] max-w-7xl items-center justify-between px-5 sm:px-8",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ApplyPilotLogo, { markClassName: "h-9 w-9" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
							"aria-label": "Landing page",
							className: "hidden items-center gap-8 md:flex",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
									href: "#features",
									className: "text-sm text-muted-foreground transition-colors hover:text-foreground",
									children: "Features"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
									href: "#how-it-works",
									className: "text-sm text-muted-foreground transition-colors hover:text-foreground",
									children: "How it works"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
									href: "#evidence",
									className: "text-sm text-muted-foreground transition-colors hover:text-foreground",
									children: "Evidence standard"
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2 sm:gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => openAuth("signin"),
								className: "px-2 text-sm font-medium transition-colors hover:text-primary",
								children: "Sign in"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								onClick: () => openAuth("signup"),
								className: "hidden sm:inline-flex",
								children: "Get started"
							})]
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "relative overflow-hidden border-b border-border/80",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							"aria-hidden": "true",
							className: "absolute -right-32 top-16 h-80 w-80 rounded-full border border-accent/25"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							"aria-hidden": "true",
							className: "absolute -right-20 top-28 h-56 w-56 rounded-full border border-primary/10"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "relative mx-auto grid min-h-[46rem] max-w-7xl items-center gap-16 px-5 py-16 sm:px-8 sm:py-24 lg:grid-cols-[minmax(0,1.02fr)_minmax(430px,0.78fr)] lg:gap-24 lg:py-28",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "max-w-3xl",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mb-7 inline-flex items-center gap-3 border-y border-border py-2 text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-primary",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-1.5 w-1.5 rounded-full bg-accent" }), "Evidence-grounded application support"]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
										className: "max-w-3xl font-serif text-[2.75rem] font-semibold leading-[1.04] tracking-[-0.04em] sm:text-6xl lg:text-[4.35rem]",
										children: "Know if you’re a real fit before you apply."
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-7 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8",
										children: "Compare your CV with the job description, see genuine strengths and gaps, improve your wording without inventing experience, and create a tailored cover letter."
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mt-9 flex flex-col gap-3 sm:flex-row",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
											size: "lg",
											onClick: () => openAuth("signup"),
											className: "h-12 px-7 shadow-sm",
											children: ["Analyze My Application", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "h-4 w-4" })]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											size: "lg",
											variant: "outline",
											asChild: true,
											className: "h-12 px-7",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
												href: "#how-it-works",
												children: "See How It Works"
											})
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "mt-9 grid max-w-2xl grid-cols-3 border-y border-border/80 py-4 text-xs text-muted-foreground",
										children: [
											["01", "Upload your CV"],
											["02", "Paste the job"],
											["03", "Get your application plan"]
										].map(([number, item], index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: `flex flex-col gap-1 px-3 first:pl-0 ${index > 0 ? "border-l border-border" : ""}`,
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "font-mono text-[0.62rem] text-accent",
												children: number
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: item })]
										}, item))
									})
								]
							}), showAuth ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "fixed inset-0 z-50 overflow-y-auto bg-background px-5 py-8",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mx-auto w-full max-w-md",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "mb-6 text-center",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ApplyPilotLogo, { markClassName: "h-9 w-9" })
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											onClick: () => setShowAuth(false),
											className: "mb-4 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground",
											children: "← Back to overview"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
											className: "w-full border-border shadow-sm",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
												className: "font-serif text-2xl",
												children: mode === "signup" ? "Start your analysis" : "Welcome back"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: mode === "signup" ? "Create an account to analyze your first application." : "Sign in to continue to ApplyPilot." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
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
									]
								})
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								id: "example",
								className: "relative scroll-mt-24 lg:py-6",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									"aria-hidden": "true",
									className: "absolute -bottom-3 -right-3 top-9 hidden w-full rounded-xl border border-accent/45 lg:block"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "relative overflow-hidden rounded-xl border border-border bg-card shadow-[0_24px_60px_rgba(31,77,61,0.12)]",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center justify-between border-b border-border bg-muted/30 px-5 py-3.5",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex items-center gap-2",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-2 w-2 rounded-full bg-primary/35" }),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-2 w-2 rounded-full bg-accent/60" }),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-2 w-2 rounded-full bg-border" })
												]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-[0.65rem] font-medium uppercase tracking-[0.16em] text-muted-foreground",
												children: "Application analysis"
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "border-b border-border px-5 py-4 sm:px-7",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-[0.68rem] font-medium uppercase tracking-[0.14em] text-muted-foreground",
												children: "Clinical Pharmacist · Community Care"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "mt-1 text-xs text-muted-foreground",
												children: "CV compared with 10 role requirements"
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "grid gap-6 px-5 py-6 sm:grid-cols-[8rem_1fr] sm:px-7",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex flex-col items-center justify-center border-b border-border pb-6 sm:border-b-0 sm:border-r sm:pb-0 sm:pr-6",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
													className: "flex h-24 w-24 items-center justify-center rounded-full border-[7px] border-primary/15 outline outline-1 outline-offset-4 outline-accent/35",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "text-center",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
															className: "font-serif text-4xl font-semibold leading-none text-primary",
															children: "80"
														}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
															className: "block text-[0.65rem] text-muted-foreground",
															children: "out of 100"
														})]
													})
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "mt-5 rounded-full bg-primary/10 px-3 py-1 text-[0.68rem] font-semibold text-primary",
													children: "Strong alignment"
												})]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-[0.68rem] font-semibold uppercase tracking-[0.15em] text-muted-foreground",
												children: "Strongest evidence"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
												className: "mt-3.5 space-y-3 text-sm text-foreground",
												children: [
													"Pharm.D matches education requirement",
													"Patient counselling experience",
													"Community pharmacy experience"
												].map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
													className: "flex gap-2.5",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[0.65rem] font-bold text-primary",
														children: "✓"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: item })]
												}, item))
											})] })]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "border-t border-border bg-[#FCF8F4] px-5 py-5 sm:px-7",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex flex-wrap items-center gap-2",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "rounded-sm border border-destructive/25 bg-card px-2 py-0.5 text-[0.62rem] font-semibold uppercase tracking-[0.12em] text-destructive",
													children: "Critical"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "text-xs font-medium text-muted-foreground",
													children: "Mandatory requirement"
												})]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "mt-3 text-sm font-medium leading-6 text-foreground",
												children: "“The CV does not evidence the required pharmacy license.”"
											})]
										})
									]
								})]
							})]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
					id: "features",
					className: "scroll-mt-24 border-b border-border/80 bg-card",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-8 border-b border-border pb-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-end",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs font-semibold uppercase tracking-[0.2em] text-primary",
								children: "One application workspace"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "mt-4 max-w-xl font-serif text-3xl font-semibold leading-tight tracking-[-0.025em] sm:text-4xl",
								children: "From “Should I apply?” to a stronger submission."
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "max-w-2xl text-sm leading-7 text-muted-foreground lg:justify-self-end",
								children: "ApplyPilot connects the four decisions job seekers usually make across separate tools—fit, CV wording, cover letter, and follow-up—without losing sight of what the CV actually proves."
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "grid md:grid-cols-2 lg:grid-cols-4",
							children: [
								{
									icon: Gauge,
									number: "01",
									title: "Analyze Fit",
									description: "See your match score, strongest evidence, and critical qualification gaps."
								},
								{
									icon: FilePenLine,
									number: "02",
									title: "Improve Your CV",
									description: "Get clearer, ATS-aware rewrites that never add unsupported experience."
								},
								{
									icon: MailCheck,
									number: "03",
									title: "Create Cover Letter",
									description: "Build a concise letter from real CV evidence and this job’s priorities."
								},
								{
									icon: ListTodo,
									number: "04",
									title: "Track Applications",
									description: "Keep roles, CV versions, statuses, and next steps in one organized view."
								}
							].map(({ icon: Icon, number, title: featureTitle, description }, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
								className: `py-8 md:px-7 lg:py-10 ${index % 2 === 1 ? "md:border-l md:border-border" : ""} ${index > 0 ? "border-t border-border md:border-t-0" : ""} ${index > 1 ? "md:border-t md:border-border lg:border-t-0" : ""} ${index > 0 ? "lg:border-l lg:border-border" : ""}`,
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center justify-between",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "flex h-10 w-10 items-center justify-center rounded-full bg-primary/8 text-primary",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "h-[1.125rem] w-[1.125rem]" })
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "font-mono text-[0.62rem] tracking-[0.16em] text-accent",
											children: number
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
										className: "mt-6 text-lg font-semibold tracking-tight",
										children: featureTitle
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-2 text-sm leading-6 text-muted-foreground",
										children: description
									})
								]
							}, featureTitle))
						})]
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
					id: "evidence",
					className: "scroll-mt-24 border-b border-border/80 bg-muted/20",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mx-auto grid max-w-7xl gap-14 px-5 py-20 sm:px-8 sm:py-28 lg:grid-cols-[0.72fr_1.28fr] lg:items-center lg:gap-24",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-primary",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-px w-8 bg-accent" }), "Evidence, not invention"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "mt-5 font-serif text-4xl font-semibold leading-[1.1] tracking-[-0.025em] sm:text-5xl",
								children: "AI that doesn’t make you more qualified than you are."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-5 text-base leading-7 text-muted-foreground",
								children: "ApplyPilot treats your CV as the source of truth. Missing qualifications stay missing. It helps you present your real experience better—not fabricate a stronger candidate."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-10 border-l-2 border-accent pl-5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "font-serif text-2xl font-semibold",
									children: "Missing stays missing."
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 text-sm leading-6 text-muted-foreground",
									children: "ApplyPilot can improve your wording. It won’t manufacture qualifications."
								})]
							})
						] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "overflow-hidden rounded-xl border border-border bg-card shadow-[0_20px_50px_rgba(31,77,61,0.09)]",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "border-b border-border px-5 py-4 sm:px-6",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground",
									children: "Rewrite integrity check"
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "divide-y divide-border",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "px-5 py-5 sm:px-6",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex flex-wrap items-center justify-between gap-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground",
												children: "Unsupported rewrite"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "rounded-full border border-border px-2.5 py-1 text-[0.65rem] font-semibold text-muted-foreground",
												children: "Rejected"
											})]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-3 text-sm leading-6 text-muted-foreground line-through decoration-muted-foreground/35",
											children: "“Administered immunizations and ensured compliance with vaccination protocols.”"
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "bg-primary/[0.035] px-5 py-5 sm:px-6",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex flex-wrap items-center justify-between gap-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-primary",
												children: "ApplyPilot rewrite"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "rounded-full bg-primary/10 px-2.5 py-1 text-[0.65rem] font-semibold text-primary",
												children: "CV-supported"
											})]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-3 text-sm font-medium leading-6 text-foreground",
											children: "“Provided patient counselling and OTC guidance in a fast-paced community pharmacy setting.”"
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center justify-between gap-4 px-5 py-4 sm:px-6",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-sm text-foreground",
											children: "Immunization training"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-xs font-medium text-muted-foreground",
											children: "Missing requirement"
										})]
									})
								]
							})]
						})]
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
					id: "how-it-works",
					className: "scroll-mt-8 border-b border-border/80",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "max-w-2xl",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-primary",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-px w-8 bg-accent" }), "The application workflow"]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "mt-5 font-serif text-4xl font-semibold tracking-[-0.025em] sm:text-5xl",
								children: "Three focused steps. One stronger application."
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-16 divide-y divide-border border-y border-border",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
									className: "grid gap-10 py-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-center lg:gap-20 lg:py-16",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-xs font-semibold tracking-[0.18em] text-primary",
											children: "01"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
											className: "mt-3 text-2xl font-semibold tracking-tight",
											children: "Analyze Fit"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-3 max-w-md text-sm leading-6 text-muted-foreground",
											children: "Understand alignment, strengths, mandatory requirements and evidence gaps."
										})
									] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "rounded-xl border border-border bg-card p-6 shadow-[0_14px_35px_rgba(31,77,61,0.07)]",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex items-center justify-between",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground",
													children: "Requirement coverage"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "font-serif text-2xl font-semibold text-primary",
													children: "80%"
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "mt-4 h-2 overflow-hidden rounded-full bg-muted",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-full w-4/5 rounded-full bg-primary" })
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "mt-4 grid grid-cols-3 gap-2 text-center text-xs",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "border-r border-border text-primary",
														children: "7 supported"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "border-r border-border text-muted-foreground",
														children: "2 partial"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "text-muted-foreground",
														children: "1 critical"
													})
												]
											})
										]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
									className: "grid gap-10 py-12 lg:grid-cols-[1.2fr_0.8fr] lg:items-center lg:gap-20 lg:py-16",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "order-2 rounded-xl border border-border bg-card p-6 shadow-[0_14px_35px_rgba(31,77,61,0.07)] lg:order-1",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground",
												children: "Original"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "mt-2 text-sm text-muted-foreground",
												children: "Helped patients understand their medicines."
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "my-4 border-t border-border" }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-primary",
												children: "Suggested rewrite"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "mt-2 text-sm font-medium leading-6",
												children: "Provided medication counselling to help patients understand safe and appropriate medicine use."
											})
										]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "order-1 lg:order-2",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-xs font-semibold tracking-[0.18em] text-primary",
												children: "02"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
												className: "mt-3 text-2xl font-semibold tracking-tight",
												children: "Improve Your CV"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "mt-3 max-w-md text-sm leading-6 text-muted-foreground",
												children: "Get targeted rewrites grounded only in experience already supported by your CV."
											})
										]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
									className: "grid gap-10 py-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-center lg:gap-20 lg:py-16",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-xs font-semibold tracking-[0.18em] text-primary",
											children: "03"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
											className: "mt-3 text-2xl font-semibold tracking-tight",
											children: "Create Your Cover Letter"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-3 max-w-md text-sm leading-6 text-muted-foreground",
											children: "Turn the strongest CV-to-job connections into a concise tailored letter."
										})
									] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "rounded-xl border border-border bg-card p-6 shadow-[0_14px_35px_rgba(31,77,61,0.07)]",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center justify-between border-b border-border pb-3",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-xs font-semibold text-foreground",
												children: "Clinical Pharmacist"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-[0.65rem] text-muted-foreground",
												children: "Tailored draft"
											})]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "mt-4 space-y-2.5",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-2 w-11/12 rounded bg-muted" }),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-2 w-full rounded bg-muted" }),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-2 w-4/5 rounded bg-muted" }),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-2 w-10/12 rounded bg-primary/15" })
											]
										})]
									})]
								})
							]
						})]
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
					id: "tracker",
					className: "scroll-mt-24 border-b border-border/80 bg-muted/20",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mx-auto grid max-w-7xl gap-14 px-5 py-20 sm:px-8 sm:py-28 lg:grid-cols-[0.68fr_1.32fr] lg:items-center lg:gap-24",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-primary",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-px w-8 bg-accent" }), "Application tracker"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "mt-5 font-serif text-4xl font-semibold tracking-[-0.025em] sm:text-5xl",
								children: "From analysis to application."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-5 text-base leading-7 text-muted-foreground",
								children: "Keep applications and CV versions organized after deciding which opportunities are worth pursuing."
							})
						] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "overflow-hidden rounded-xl border border-border bg-card shadow-[0_20px_50px_rgba(31,77,61,0.09)]",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid grid-cols-[1fr_auto] gap-4 border-b border-border px-5 py-3 text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Application" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Status" })]
							}), [
								["Community Pharmacist", "Saved"],
								["Clinical Pharmacist", "Applied"],
								["Pharmacy Resident", "Interview"]
							].map(([role, status]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid grid-cols-[1fr_auto] items-center gap-4 border-b border-border px-5 py-4 last:border-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm font-medium",
									children: role
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 text-xs text-muted-foreground",
									children: "CV attached"
								})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: `rounded-full px-2.5 py-1 text-[0.68rem] font-medium ${status === "Interview" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`,
									children: status
								})]
							}, role))]
						})]
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "relative overflow-hidden bg-primary text-primary-foreground",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						"aria-hidden": "true",
						className: "absolute -bottom-28 -right-20 h-72 w-72 rounded-full border border-primary-foreground/10"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative mx-auto flex max-w-7xl flex-col items-start justify-between gap-9 px-5 py-16 sm:px-8 sm:py-20 md:flex-row md:items-center",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "max-w-2xl font-serif text-3xl font-semibold leading-tight tracking-tight sm:text-4xl",
							children: "Know what matches. Know what doesn’t. Apply with evidence."
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "lg",
							variant: "secondary",
							onClick: () => openAuth("signup"),
							className: "h-11 shrink-0 px-6",
							children: ["Analyze My Application", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "h-4 w-4" })]
						})]
					})]
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("footer", {
				className: "border-t border-border",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto flex max-w-6xl flex-col gap-3 px-5 py-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-8",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ApplyPilotLogo, {
						markClassName: "h-7 w-7",
						wordmarkClassName: "text-base text-foreground"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Evidence-grounded support for better job applications." })]
				})
			})
		]
	});
}
//#endregion
export { AuthPage as component };
