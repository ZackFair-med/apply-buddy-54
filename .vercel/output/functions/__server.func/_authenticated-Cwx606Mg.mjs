import { o as __toESM } from "./_runtime.mjs";
import { g as Link } from "./_libs/@tanstack/react-router+[...].mjs";
import { u as require_react } from "./_libs/@floating-ui/react-dom+[...].mjs";
import { P as require_jsx_runtime } from "./_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { n as useServerFn } from "./_ssr/createSsrRpc-C19MdsU6.mjs";
import { t as Button } from "./_ssr/button-Dts1Y2ez.mjs";
import { t as Input } from "./_ssr/input-B2ae_v7j.mjs";
import { t as Label } from "./_ssr/label-atB1Bfyt.mjs";
import { n as CardContent, t as Card } from "./_ssr/card-Cyf-osIi.mjs";
import { c as Pencil, j as ArrowRight, s as Plus } from "./_libs/lucide-react.mjs";
import { a as DialogTitle, i as DialogHeader, n as DialogContent, o as DialogTrigger, r as DialogFooter, t as Dialog } from "./_ssr/dialog-DNJhajil.mjs";
import { i as listJobs } from "./_ssr/jobs.functions-Davk0hjS.mjs";
import { n as getProfile, r as updateProfile } from "./_ssr/profile.functions-BG2aaBM4.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "./_libs/tanstack__react-query.mjs";
import { n as toast } from "./_libs/sonner.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_authenticated-Cwx606Mg.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function formatMonthYear(iso) {
	if (!iso) return "—";
	const d = new Date(iso);
	if (Number.isNaN(d.getTime())) return "—";
	return d.toLocaleDateString(void 0, {
		month: "long",
		year: "numeric"
	});
}
function formatSalary(min, max, currency) {
	if (!min && !max) return "—";
	const cur = currency || "USD";
	const fmt = (n) => new Intl.NumberFormat(void 0, {
		style: "currency",
		currency: cur,
		maximumFractionDigits: 0
	}).format(n);
	if (min && max) return `${fmt(min)} — ${fmt(max)}`;
	return fmt(min ?? max);
}
function DashboardPage() {
	const qc = useQueryClient();
	const listFn = useServerFn(listJobs);
	const getProfileFn = useServerFn(getProfile);
	const updateProfileFn = useServerFn(updateProfile);
	const { data: jobs = [] } = useQuery({
		queryKey: ["jobs"],
		queryFn: () => listFn()
	});
	const { data: profile } = useQuery({
		queryKey: ["profile"],
		queryFn: () => getProfileFn()
	});
	const counts = (0, import_react.useMemo)(() => {
		const base = {
			saved: 0,
			applied: 0,
			interview: 0,
			offer: 0,
			rejected: 0
		};
		for (const j of jobs) base[j.status] = (base[j.status] ?? 0) + 1;
		return base;
	}, [jobs]);
	const weeklyGoal = profile?.weekly_goal ?? 5;
	const appliedThisWeek = (0, import_react.useMemo)(() => {
		const start = /* @__PURE__ */ new Date();
		start.setDate(start.getDate() - 7);
		return jobs.filter((j) => j.status === "applied" && new Date(j.created_at) >= start).length;
	}, [jobs]);
	const pct = Math.min(1, weeklyGoal > 0 ? appliedThisWeek / weeklyGoal : 0);
	const ringPct = Math.round(pct * 100);
	const pipeline = [
		{
			label: "Bookmarked / Saved",
			count: counts.saved,
			color: "var(--muted-foreground)"
		},
		{
			label: "Applied",
			count: counts.applied,
			color: "var(--primary)"
		},
		{
			label: "Interviewing",
			count: counts.interview,
			color: "oklch(0.6 0.11 160)"
		},
		{
			label: "Negotiating / Offer",
			count: counts.offer,
			color: "oklch(0.7 0.14 60)"
		}
	];
	const maxPipeline = Math.max(1, ...pipeline.map((p) => p.count));
	const [goalOpen, setGoalOpen] = (0, import_react.useState)(false);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto grid max-w-5xl grid-cols-1 gap-5 md:grid-cols-2",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
				className: "border-border shadow-sm md:col-span-2",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
					className: "p-5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-4 flex items-center justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-serif text-xl text-primary",
							children: "Next Career Goal"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Dialog, {
							open: goalOpen,
							onOpenChange: setGoalOpen,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTrigger, {
								asChild: true,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "ghost",
									size: "icon",
									className: "h-8 w-8 text-primary/70 hover:text-primary",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "h-4 w-4" })
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GoalDialog, {
								profile,
								onSaved: () => {
									setGoalOpen(false);
									qc.invalidateQueries({ queryKey: ["profile"] });
								},
								fn: updateProfileFn
							})]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-2 gap-y-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GoalField, {
								label: "Target Title",
								value: profile?.target_title || "—",
								accent: true
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GoalField, {
								label: "Target Date",
								value: formatMonthYear(profile?.target_date)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "col-span-2",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GoalField, {
									label: "Target Salary Range",
									value: formatSalary(profile?.target_salary_min ?? null, profile?.target_salary_max ?? null, profile?.target_salary_currency ?? "USD")
								})
							})
						]
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
				className: "border-border shadow-sm",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
					className: "flex flex-col items-center p-6 text-center",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "mb-6 w-full text-left font-serif text-lg text-primary",
							children: "Job Applications"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "relative flex h-36 w-36 items-center justify-center rounded-full",
							style: { background: `conic-gradient(var(--primary) 0% ${ringPct}%, var(--muted) ${ringPct}% 100%)` },
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex h-28 w-28 flex-col items-center justify-center rounded-full bg-card",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-3xl font-bold text-primary",
									children: appliedThisWeek
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "mt-0.5 text-[10px] font-medium leading-tight text-muted-foreground",
									children: [
										"APPLICATIONS",
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
										"SENT"
									]
								})]
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-6 w-full",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "inline-block rounded-full bg-primary px-4 py-1 text-xs font-semibold text-primary-foreground",
								children: [
									"Goal: ",
									weeklyGoal,
									" / week"
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-4 text-[11px] italic leading-relaxed text-muted-foreground",
								children: "Move jobs to \"Applied\" in your tracker to update your weekly goal progress."
							})]
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
				className: "border-border shadow-sm",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
					className: "p-6",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "mb-1 font-serif text-lg text-primary",
							children: "Application Pipeline"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mb-6 text-[10px] text-muted-foreground",
							children: "All-time activity"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "space-y-5",
							children: pipeline.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex justify-between text-[11px] font-medium text-foreground/80",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: p.label }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-bold",
										children: p.count
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "h-2 w-full overflow-hidden rounded-full bg-muted",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "h-full rounded-full transition-all",
										style: {
											width: `${p.count / maxPipeline * 100}%`,
											background: p.color
										}
									})
								})]
							}, p.label))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-6 flex items-center justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								asChild: true,
								variant: "ghost",
								size: "sm",
								className: "text-primary",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
									to: "/jobs",
									children: ["View all jobs ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "ml-1 h-3.5 w-3.5" })]
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								asChild: true,
								size: "sm",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
									to: "/jobs",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "mr-1 h-3.5 w-3.5" }), " Add job"]
								})
							})]
						})
					]
				})
			})
		]
	});
}
function GoalField({ label, value, accent }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "mb-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground",
		children: label
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: `text-sm font-semibold ${accent ? "text-primary" : "text-foreground/90"}`,
		children: value
	})] });
}
function GoalDialog({ profile, onSaved, fn }) {
	const [form, setForm] = (0, import_react.useState)({
		target_title: "",
		target_date: "",
		target_salary_min: "",
		target_salary_max: "",
		target_salary_currency: "USD",
		weekly_goal: "5"
	});
	(0, import_react.useEffect)(() => {
		if (profile) setForm({
			target_title: profile.target_title ?? "",
			target_date: profile.target_date ?? "",
			target_salary_min: profile.target_salary_min?.toString() ?? "",
			target_salary_max: profile.target_salary_max?.toString() ?? "",
			target_salary_currency: profile.target_salary_currency ?? "USD",
			weekly_goal: (profile.weekly_goal ?? 5).toString()
		});
	}, [profile]);
	const save = useMutation({
		mutationFn: () => fn({ data: {
			target_title: form.target_title.trim() || null,
			target_date: form.target_date || null,
			target_salary_min: form.target_salary_min ? Number(form.target_salary_min) : null,
			target_salary_max: form.target_salary_max ? Number(form.target_salary_max) : null,
			target_salary_currency: form.target_salary_currency || "USD",
			weekly_goal: form.weekly_goal ? Number(form.weekly_goal) : 5
		} }),
		onSuccess: () => {
			toast.success("Goal updated");
			onSaved();
		},
		onError: (e) => toast.error(e.message)
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Edit career goal" }) }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Target title" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: form.target_title,
						onChange: (e) => setForm((f) => ({
							...f,
							target_title: e.target.value
						})),
						placeholder: "e.g. Product Strategist"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-2 gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Target date" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							type: "date",
							value: form.target_date,
							onChange: (e) => setForm((f) => ({
								...f,
								target_date: e.target.value
							}))
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Weekly apply goal" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							type: "number",
							min: 1,
							max: 100,
							value: form.weekly_goal,
							onChange: (e) => setForm((f) => ({
								...f,
								weekly_goal: e.target.value
							}))
						})]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-3 gap-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Currency" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: form.target_salary_currency,
								onChange: (e) => setForm((f) => ({
									...f,
									target_salary_currency: e.target.value.toUpperCase()
								})),
								maxLength: 4
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Salary min" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								type: "number",
								min: 0,
								value: form.target_salary_min,
								onChange: (e) => setForm((f) => ({
									...f,
									target_salary_min: e.target.value
								}))
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Salary max" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								type: "number",
								min: 0,
								value: form.target_salary_max,
								onChange: (e) => setForm((f) => ({
									...f,
									target_salary_max: e.target.value
								}))
							})]
						})
					]
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogFooter, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			onClick: () => save.mutate(),
			disabled: save.isPending,
			children: save.isPending ? "Saving…" : "Save goal"
		}) })
	] });
}
//#endregion
export { DashboardPage as component };
