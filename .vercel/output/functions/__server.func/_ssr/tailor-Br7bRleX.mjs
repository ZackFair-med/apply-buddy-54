import { o as __toESM } from "../_runtime.mjs";
import { l as createServerFn } from "./esm-9EjmF9OT.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { P as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { n as useServerFn, t as createSsrRpc } from "./createSsrRpc-C19MdsU6.mjs";
import { r as cn, t as Button } from "./button-Dts1Y2ez.mjs";
import { t as Input } from "./input-B2ae_v7j.mjs";
import { t as Label } from "./label-atB1Bfyt.mjs";
import { C as Circle, E as ChevronRight, O as Check, _ as FileText, a as Tags, b as Download, f as LoaderCircle, g as Gauge, o as Sparkles, w as CircleAlert, x as Copy } from "../_libs/lucide-react.mjs";
import { t as requireSupabaseAuth } from "./auth-middleware-B3XILrvZ.mjs";
import { i as objectType, n as enumType, o as stringType } from "../_libs/zod.mjs";
import { n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { r as listCvs } from "./cvs.functions-CntEYJB8.mjs";
import { t as getUsageSummary } from "./usage.functions-DSyj1fML.mjs";
import { t as Badge } from "./badge-DL6jAwQF.mjs";
import { t as UpgradePrompt } from "./UpgradePrompt-CmGIYmfn.mjs";
import { a as Label2, c as Root2, d as SubTrigger2, f as Trigger, i as ItemIndicator2, l as Separator2, n as Content2, o as Portal2, r as Item2, s as RadioItem2, t as CheckboxItem2, u as SubContent2 } from "../_libs/@radix-ui/react-dropdown-menu+[...].mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, o as Textarea, r as SelectItem, t as Select } from "./select-DrpMbznq.mjs";
import { n as Root, t as Indicator } from "../_libs/radix-ui__react-progress.mjs";
import { t as require_jspdf_node_min } from "../_libs/jspdf.mjs";
import { i as TextRun, n as Packer, r as Paragraph, t as File } from "../_libs/docx.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/tailor-Br7bRleX.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var import_jspdf_node_min = /* @__PURE__ */ __toESM(require_jspdf_node_min());
var inputSchema = objectType({
	cvId: stringType().uuid(),
	jobDescription: stringType().min(30).max(3e4),
	jobTitle: stringType().max(200).optional(),
	company: stringType().max(200).optional(),
	jobId: stringType().uuid().optional()
});
var letterInputSchema = inputSchema.extend({ tone: enumType([
	"formal",
	"warm",
	"confident"
]).optional() });
var analyzeMatch = createServerFn({ method: "POST" }).validator((d) => inputSchema.parse(d)).middleware([requireSupabaseAuth]).handler(createSsrRpc("4abacc882bd13bcdc7a0a5dcb68d2f908b598dee19711ba74816a9bf895ce960"));
var extractKeywords = createServerFn({ method: "POST" }).validator((d) => inputSchema.parse(d)).middleware([requireSupabaseAuth]).handler(createSsrRpc("8ca2404dc8aefb21eebf56d676fd57337f9420879476ad174be364776cfe7a32"));
var generateCoverLetter = createServerFn({ method: "POST" }).validator((d) => letterInputSchema.parse(d)).middleware([requireSupabaseAuth]).handler(createSsrRpc("db1ed20c317dc9f90eff319ec6aa929a298d1332e777ffd1bdd52a5215228f82"));
var Progress = import_react.forwardRef(({ className, value, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Root, {
	ref,
	className: cn("relative h-2 w-full overflow-hidden rounded-full bg-primary/20", className),
	...props,
	children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Indicator, {
		className: "h-full w-full flex-1 bg-primary transition-all",
		style: { transform: `translateX(-${100 - (value || 0)}%)` }
	})
}));
Progress.displayName = Root.displayName;
var DropdownMenu = Root2;
var DropdownMenuTrigger = Trigger;
var DropdownMenuSubTrigger = import_react.forwardRef(({ className, inset, children, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SubTrigger2, {
	ref,
	className: cn("flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent data-[state=open]:bg-accent [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0", inset && "pl-8", className),
	...props,
	children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "ml-auto" })]
}));
DropdownMenuSubTrigger.displayName = SubTrigger2.displayName;
var DropdownMenuSubContent = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SubContent2, {
	ref,
	className: cn("z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-(--radix-dropdown-menu-content-transform-origin)", className),
	...props
}));
DropdownMenuSubContent.displayName = SubContent2.displayName;
var DropdownMenuContent = import_react.forwardRef(({ className, sideOffset = 4, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Portal2, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Content2, {
	ref,
	sideOffset,
	className: cn("z-50 max-h-[var(--radix-dropdown-menu-content-available-height)] min-w-[8rem] overflow-y-auto overflow-x-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md", "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-(--radix-dropdown-menu-content-transform-origin)", className),
	...props
}) }));
DropdownMenuContent.displayName = Content2.displayName;
var DropdownMenuItem = import_react.forwardRef(({ className, inset, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Item2, {
	ref,
	className: cn("relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&>svg]:size-4 [&>svg]:shrink-0", inset && "pl-8", className),
	...props
}));
DropdownMenuItem.displayName = Item2.displayName;
var DropdownMenuCheckboxItem = import_react.forwardRef(({ className, children, checked, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CheckboxItem2, {
	ref,
	className: cn("relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50", className),
	checked,
	...props,
	children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "absolute left-2 flex h-3.5 w-3.5 items-center justify-center",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ItemIndicator2, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-4 w-4" }) })
	}), children]
}));
DropdownMenuCheckboxItem.displayName = CheckboxItem2.displayName;
var DropdownMenuRadioItem = import_react.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(RadioItem2, {
	ref,
	className: cn("relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50", className),
	...props,
	children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "absolute left-2 flex h-3.5 w-3.5 items-center justify-center",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ItemIndicator2, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Circle, { className: "h-2 w-2 fill-current" }) })
	}), children]
}));
DropdownMenuRadioItem.displayName = RadioItem2.displayName;
var DropdownMenuLabel = import_react.forwardRef(({ className, inset, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label2, {
	ref,
	className: cn("px-2 py-1.5 text-sm font-semibold", inset && "pl-8", className),
	...props
}));
DropdownMenuLabel.displayName = Label2.displayName;
var DropdownMenuSeparator = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Separator2, {
	ref,
	className: cn("-mx-1 my-1 h-px bg-muted", className),
	...props
}));
DropdownMenuSeparator.displayName = Separator2.displayName;
var DropdownMenuShortcut = ({ className, ...props }) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn("ml-auto text-xs tracking-widest opacity-60", className),
		...props
	});
};
DropdownMenuShortcut.displayName = "DropdownMenuShortcut";
function TailorPage() {
	const list = useServerFn(listCvs);
	const analyzeFn = useServerFn(analyzeMatch);
	const keywordsFn = useServerFn(extractKeywords);
	const letterFn = useServerFn(generateCoverLetter);
	const usageFn = useServerFn(getUsageSummary);
	const { data: cvs = [] } = useQuery({
		queryKey: ["cvs"],
		queryFn: () => list()
	});
	const { data: usage, refetch: refetchUsage } = useQuery({
		queryKey: ["usage-summary"],
		queryFn: () => usageFn()
	});
	const [cvId, setCvId] = (0, import_react.useState)("");
	const [jd, setJd] = (0, import_react.useState)("");
	const [title, setTitle] = (0, import_react.useState)("");
	const [company, setCompany] = (0, import_react.useState)("");
	const [activeStep, setActiveStep] = (0, import_react.useState)("fit");
	const [analysis, setAnalysis] = (0, import_react.useState)(null);
	const [keywords, setKeywords] = (0, import_react.useState)(null);
	const [letter, setLetter] = (0, import_react.useState)(null);
	const [upgrade, setUpgrade] = (0, import_react.useState)(null);
	const [contextSnapshots, setContextSnapshots] = (0, import_react.useState)({});
	const workspaceRef = (0, import_react.useRef)(null);
	const payload = () => ({
		cvId,
		jobDescription: jd,
		jobTitle: title || void 0,
		company: company || void 0
	});
	const scrollWorkspace = () => {
		setTimeout(() => {
			workspaceRef.current?.scrollIntoView({
				behavior: "smooth",
				block: "start"
			});
		}, 100);
	};
	const handleResult = (feature, targetStep, onSuccess, errLabel) => ({
		onSuccess: (r) => {
			if (r?.limitReached) {
				setUpgrade(feature);
				return;
			}
			setUpgrade((prev) => prev === feature ? null : prev);
			onSuccess(r);
			setContextSnapshots((current) => ({
				...current,
				[targetStep]: {
					cvId,
					jd,
					title,
					company
				}
			}));
			setActiveStep(targetStep);
			scrollWorkspace();
			refetchUsage();
		},
		onError: (e) => toast.error(e instanceof Error ? e.message : errLabel)
	});
	const runAnalyze = useMutation({
		mutationFn: () => analyzeFn({ data: payload() }),
		...handleResult("match_score", "fit", (r) => setAnalysis(r), "Analysis failed")
	});
	const runKeywords = useMutation({
		mutationFn: () => keywordsFn({ data: payload() }),
		...handleResult("keywords", "cv", (r) => setKeywords(r), "Keyword extraction failed")
	});
	const runLetter = useMutation({
		mutationFn: (tone) => letterFn({ data: {
			...payload(),
			tone
		} }),
		...handleResult("cover_letter", "letter", (r) => setLetter(r.coverLetter), "Cover letter failed")
	});
	const disabled = !cvId || jd.length < 30;
	const activeSnapshot = contextSnapshots[activeStep];
	const isStale = Boolean(activeSnapshot && (activeSnapshot.cvId !== cvId || activeSnapshot.jd !== jd || activeSnapshot.title !== title || activeSnapshot.company !== company));
	const steps = [
		{
			key: "fit",
			label: "Analyze Fit",
			shortLabel: "Analyze Fit",
			icon: Gauge,
			isDone: Boolean(analysis),
			isLoading: runAnalyze.isPending,
			usageInfo: usage?.matchScore
		},
		{
			key: "cv",
			label: "Improve CV",
			shortLabel: "Improve CV",
			icon: Tags,
			isDone: Boolean(keywords),
			isLoading: runKeywords.isPending,
			usageInfo: usage?.keywords
		},
		{
			key: "letter",
			label: "Cover Letter",
			shortLabel: "Cover Letter",
			icon: FileText,
			isDone: Boolean(letter),
			isLoading: runLetter.isPending,
			usageInfo: usage?.coverLetter
		}
	];
	const fitExhausted = Boolean(usage?.matchScore.limit) && usage.matchScore.used >= usage.matchScore.limit;
	const cvExhausted = Boolean(usage?.keywords.limit) && usage.keywords.used >= usage.keywords.limit;
	const letterExhausted = Boolean(usage?.coverLetter.limit) && usage.coverLetter.used >= usage.coverLetter.limit;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-serif text-3xl leading-tight text-foreground",
					children: "AI Assistant"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground",
					children: "Analyze fit, improve your CV, and draft a cover letter — step by step."
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-lg border border-border bg-card p-5 space-y-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-4 sm:grid-cols-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								className: "text-xs font-semibold uppercase tracking-wide text-muted-foreground",
								children: "CV"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
								value: cvId,
								onValueChange: setCvId,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Select a CV" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: cvs.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: c.id,
									children: c.label
								}, c.id)) })]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
								className: "text-xs font-semibold uppercase tracking-wide text-muted-foreground",
								children: [
									"Job title",
									" ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "normal-case font-normal tracking-normal text-muted-foreground/60",
										children: "(optional)"
									})
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: title,
								onChange: (e) => setTitle(e.target.value),
								placeholder: "e.g. Senior Product Manager"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
								className: "text-xs font-semibold uppercase tracking-wide text-muted-foreground",
								children: [
									"Company",
									" ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "normal-case font-normal tracking-normal text-muted-foreground/60",
										children: "(optional)"
									})
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: company,
								onChange: (e) => setCompany(e.target.value),
								placeholder: "e.g. Acme Corp"
							})]
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						className: "text-xs font-semibold uppercase tracking-wide text-muted-foreground",
						children: "Job description"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
						rows: 6,
						value: jd,
						onChange: (e) => setJd(e.target.value),
						placeholder: "Paste the full job posting here…",
						className: "resize-none"
					})]
				})]
			}),
			upgrade && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UpgradePrompt, {
				feature: upgrade,
				onDismiss: () => setUpgrade(null),
				onUpgrade: () => toast.info("Upgrade flow coming soon")
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex rounded-lg border border-border bg-muted/40 p-1 gap-1",
					role: "tablist",
					"aria-label": "AI workflow steps",
					children: steps.map((step, idx) => {
						const Icon = step.icon;
						const isActive = activeStep === step.key;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							role: "tab",
							"aria-selected": isActive,
							onClick: () => setActiveStep(step.key),
							className: ["relative flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", isActive ? "bg-white text-primary shadow-sm border border-border/60" : "text-muted-foreground hover:text-foreground hover:bg-white/50"].join(" "),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "hidden sm:flex items-center gap-1.5 min-w-0",
								children: [step.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-3.5 w-3.5 animate-spin shrink-0" }) : step.isDone ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-3.5 w-3.5 text-primary shrink-0" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-xs font-bold text-muted-foreground/60 shrink-0 w-3.5 text-center",
									children: idx + 1
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "truncate",
									children: step.label
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "flex sm:hidden items-center gap-1",
								children: step.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 animate-spin" }) : step.isDone ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-4 w-4 text-primary" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "h-4 w-4" })
							})]
						}, step.key);
					})
				}), (() => {
					const info = steps.find((s) => s.key === activeStep)?.usageInfo;
					if (!info || info.limit === null) return null;
					const left = Math.max(0, info.limit - info.used);
					const isWeekly = activeStep === "letter" && usage?.coverLetter.window === "week";
					if (left === 0) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "px-0.5 text-xs font-medium text-amber-700",
						children: isWeekly ? "Weekly limit reached" : "Daily limit reached · Resets tomorrow"
					});
					const period = isWeekly ? "this week" : "today";
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "px-0.5 text-xs text-muted-foreground",
						children: [
							left,
							" of ",
							info.limit,
							" remaining ",
							period
						]
					});
				})()]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				ref: workspaceRef,
				className: "scroll-mt-4 space-y-5",
				children: [
					isStale && (analysis || keywords || letter) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2.5 rounded-md border border-amber-400/30 bg-amber-50 px-3.5 py-2.5 text-xs text-amber-800",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, { className: "h-3.5 w-3.5 shrink-0 text-amber-600" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Application details changed. Re-run the step below to refresh results." })]
					}),
					activeStep === "fit" && (runAnalyze.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WorkspaceLoading, { message: "Evaluating job match & candidate fit…" }) : analysis ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnalysisView, {
						analysis,
						isPaid: usage?.plan === "paid",
						onRegenerate: () => runAnalyze.mutate(),
						regenerateDisabled: disabled || fitExhausted
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WorkspaceEmpty, {
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Gauge, { className: "h-5 w-5 text-primary" }),
						title: "Analyze Fit",
						description: "See your match score, strengths, and qualification gaps for this role.",
						cta: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							onClick: () => runAnalyze.mutate(),
							disabled: disabled || runAnalyze.isPending || fitExhausted,
							size: "sm",
							children: [runAnalyze.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-1.5 h-3.5 w-3.5 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Gauge, { className: "mr-1.5 h-3.5 w-3.5" }), "Run Analysis"]
						})
					})),
					activeStep === "cv" && (runKeywords.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WorkspaceLoading, { message: "Extracting keywords & generating CV bullet rewrites…" }) : keywords ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeywordsView, {
						keywords,
						onRegenerate: () => runKeywords.mutate(),
						regenerateDisabled: disabled || cvExhausted
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WorkspaceEmpty, {
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tags, { className: "h-5 w-5 text-primary" }),
						title: "Improve CV",
						description: "Get tailored keyword suggestions and CV bullet rewrites for this role.",
						cta: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							onClick: () => runKeywords.mutate(),
							disabled: disabled || runKeywords.isPending || cvExhausted,
							size: "sm",
							children: [runKeywords.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-1.5 h-3.5 w-3.5 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tags, { className: "mr-1.5 h-3.5 w-3.5" }), "Improve CV"]
						})
					})),
					activeStep === "letter" && (runLetter.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WorkspaceLoading, { message: "Writing tailored cover letter…" }) : letter ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LetterView, {
						letter,
						onRegenerate: (tone) => runLetter.mutate(tone),
						isRegenerating: runLetter.isPending,
						regenerateDisabled: disabled || letterExhausted,
						company
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WorkspaceEmpty, {
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "h-5 w-5 text-primary" }),
						title: "Cover Letter",
						description: "Generate a tailored cover letter based on your CV and this job description.",
						cta: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							onClick: () => runLetter.mutate(void 0),
							disabled: disabled || runLetter.isPending || letterExhausted,
							size: "sm",
							children: [runLetter.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-1.5 h-3.5 w-3.5 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "mr-1.5 h-3.5 w-3.5" }), "Write Cover Letter"]
						})
					}))
				]
			})
		]
	});
}
function WorkspaceLoading({ message }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col items-center justify-center gap-3 rounded-lg border border-border bg-card py-12 text-center",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-6 w-6 animate-spin text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm text-muted-foreground",
			children: message
		})]
	});
}
function WorkspaceEmpty({ icon, title, description, cta }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border bg-card px-6 py-10 text-center",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex h-10 w-10 items-center justify-center rounded-full bg-primary/8 text-primary",
				children: icon
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm font-medium text-foreground",
					children: title
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "max-w-xs text-xs text-muted-foreground",
					children: description
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "pt-1",
				children: cta
			})
		]
	});
}
function getVerdict(score, gaps) {
	if (gaps.filter((g) => g.severity === "critical").length > 0) {
		if (score >= 75) return {
			title: "Good Alignment — Critical Gap",
			variant: "destructive",
			description: "Strong overall match, but a mandatory requirement is missing."
		};
		return {
			title: "Significant Gaps",
			variant: "destructive",
			description: "Must-have qualifications or mandatory requirements are missing."
		};
	}
	if (score >= 80) return {
		title: "Strong Fit",
		variant: "default",
		description: "Excellent alignment with role requirements."
	};
	if (score >= 65) return {
		title: "Good Fit — Minor Improvements",
		variant: "secondary",
		description: "Solid background with minor adjustments needed."
	};
	if (score >= 50) return {
		title: "Moderate Fit — Address Key Gaps",
		variant: "outline",
		description: "Meets basic prerequisites but has notable gaps."
	};
	return {
		title: "Significant Gaps",
		variant: "destructive",
		description: "Multiple key qualifications are missing for this position."
	};
}
function AnalysisView({ analysis, isPaid, onRegenerate, regenerateDisabled }) {
	const rawGaps = analysis.gaps ?? [];
	const legacyWeaknesses = analysis.weaknesses ?? [];
	const gaps = rawGaps.length > 0 ? rawGaps : legacyWeaknesses.map((w) => ({
		issue: w,
		severity: "important",
		recommendation: "Address or highlight relevant experience for this requirement."
	}));
	const verdict = getVerdict(analysis.matchScore, gaps);
	const scoreColor = verdict.variant === "destructive" ? "text-destructive" : analysis.matchScore >= 80 ? "text-emerald-700" : "text-primary";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-lg border border-border bg-card p-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col sm:flex-row sm:items-center justify-between gap-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs font-semibold uppercase tracking-wide text-muted-foreground",
							children: "Match Score"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-baseline gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: `font-serif text-5xl leading-none ${scoreColor}`,
								children: analysis.matchScore
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-sm text-muted-foreground",
								children: "/ 100"
							})]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col items-start sm:items-end gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								variant: verdict.variant,
								className: "font-medium",
								children: verdict.title
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs text-muted-foreground",
								children: verdict.description
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								size: "sm",
								variant: "outline",
								onClick: onRegenerate,
								disabled: regenerateDisabled,
								className: "mt-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "mr-1.5 h-3.5 w-3.5" }), "Re-run analysis"]
							})
						]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Progress, {
					value: analysis.matchScore,
					className: "mt-4 h-1.5"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4 md:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-lg border border-border bg-card p-5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "mb-3 text-sm font-semibold text-foreground",
						children: "Strengths"
					}), analysis.strengths.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "space-y-2 text-sm",
						children: analysis.strengths.map((s, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "flex gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/60 mt-[7px]" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-muted-foreground",
								children: s
							})]
						}, i))
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted-foreground",
						children: "No specific strengths listed."
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-lg border border-border bg-card p-5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "mb-3 text-sm font-semibold text-foreground",
						children: "Gaps to Address"
					}), gaps.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "space-y-3",
						children: gaps.map((g, i) => {
							const isCritical = g.severity === "critical";
							const isImportant = g.severity === "important";
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: `rounded-md border p-3 text-sm space-y-1.5 ${isCritical ? "border-destructive/30 bg-destructive/5" : "border-border bg-background"}`,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-start justify-between gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "font-medium text-foreground leading-snug",
										children: g.issue
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: `shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${isCritical ? "bg-destructive/10 text-destructive" : isImportant ? "bg-amber-500/10 text-amber-700" : "bg-muted text-muted-foreground"}`,
										children: g.severity
									})]
								}), g.recommendation && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-xs text-muted-foreground leading-relaxed border-t border-border/50 pt-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "font-medium text-foreground",
										children: ["Action:", " "]
									}), g.recommendation]
								})]
							}, i);
						})
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted-foreground",
						children: "No critical or major gaps identified."
					})]
				})]
			}),
			!isPaid && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-xs text-muted-foreground",
				children: [
					"Paid plans save match history so you can compare roles over time.",
					" ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						href: "/profile",
						className: "underline underline-offset-2",
						children: "Upgrade"
					})
				]
			})
		]
	});
}
function KeywordsView({ keywords, onRegenerate, regenerateDisabled }) {
	const rewrites = keywords.suggestedRewrites ?? [];
	async function copyBullet(text) {
		try {
			await navigator.clipboard.writeText(text);
			toast.success("Copied to clipboard");
		} catch {
			toast.error("Could not copy");
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "overflow-hidden rounded-xl border border-border bg-card",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "border-b border-border px-5 py-5 sm:px-7 sm:py-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-start gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "h-4 w-4" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "text-lg font-semibold tracking-tight text-foreground",
								children: "CV Improvements"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-0.5 text-sm text-muted-foreground",
								children: [
									rewrites.length,
									" targeted ",
									rewrites.length === 1 ? "rewrite" : "rewrites",
									" for this role"
								]
							})]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						size: "sm",
						variant: "outline",
						onClick: onRegenerate,
						disabled: regenerateDisabled,
						className: "w-full sm:w-auto",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "mr-1.5 h-3.5 w-3.5" }), "Regenerate improvements"]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-4 max-w-2xl text-xs leading-relaxed text-muted-foreground",
					children: "Review every suggestion before using it. ApplyPilot only rewrites CV-supported experience."
				})]
			}),
			rewrites.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "divide-y divide-border px-5 sm:px-7",
				children: rewrites.map((r, idx) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
					className: "grid gap-4 py-7 sm:grid-cols-[2.5rem_minmax(0,1fr)] sm:gap-5 sm:py-8",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-xs font-semibold tabular-nums tracking-[0.18em] text-primary/70",
						children: String(idx + 1).padStart(2, "0")
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0 max-w-3xl",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-primary",
								children: "Suggested rewrite"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 whitespace-pre-wrap text-base font-medium leading-7 text-foreground sm:text-[1.05rem]",
								children: r.suggested
							})] }),
							r.targetKeywords && r.targetKeywords.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-4 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs text-muted-foreground",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-medium text-foreground/70",
									children: "Relevant to:"
								}), r.targetKeywords.map((kw, keywordIndex) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "inline-flex items-center gap-1.5",
									children: [keywordIndex > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										"aria-hidden": "true",
										children: "·"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: kw })]
								}, kw))]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-5 border-l-2 border-border pl-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground",
									children: "Original"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1.5 whitespace-pre-wrap text-sm leading-6 text-muted-foreground",
									children: r.original
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-5 flex justify-end",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									size: "sm",
									variant: "outline",
									onClick: () => copyBullet(r.suggested),
									className: "w-full sm:w-auto",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, { className: "mr-1.5 h-3.5 w-3.5" }), "Copy rewrite"]
								})
							})
						]
					})]
				}, idx))
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "border-b border-border px-5 py-8 sm:px-7",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground",
					children: "No high-value CV rewrites were identified for this role."
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "border-t border-border bg-muted/20 px-5 py-6 sm:px-7",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground",
					children: "Keyword summary"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-4 grid gap-6 md:grid-cols-2 md:gap-8",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
						className: "mb-2.5 text-sm font-semibold text-foreground",
						children: "Missing Keywords"
					}), keywords.missingKeywords.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex flex-wrap gap-1.5",
						children: keywords.missingKeywords.map((k) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							variant: "outline",
							className: "bg-background font-normal",
							children: k
						}, k))
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted-foreground",
						children: "No missing keywords found."
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
						className: "mb-2.5 text-sm font-semibold text-foreground",
						children: "Matched Keywords"
					}), keywords.matchedKeywords.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex flex-wrap gap-1.5",
						children: keywords.matchedKeywords.map((k) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							variant: "secondary",
							className: "font-normal",
							children: k
						}, k))
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted-foreground",
						children: "No matched keywords found."
					})] })]
				})]
			})
		]
	});
}
function LetterView({ letter, onRegenerate, isRegenerating, regenerateDisabled, company }) {
	const tones = [
		{
			key: "formal",
			label: "Formal"
		},
		{
			key: "warm",
			label: "Warm"
		},
		{
			key: "confident",
			label: "Confident"
		}
	];
	function buildPdf() {
		const doc = new import_jspdf_node_min.default({
			unit: "pt",
			format: "letter"
		});
		const marginX = 56;
		const marginY = 64;
		const pageWidth = doc.internal.pageSize.getWidth();
		const pageHeight = doc.internal.pageSize.getHeight();
		const usableWidth = pageWidth - marginX * 2;
		doc.setFont("times", "normal");
		doc.setFontSize(11);
		const lines = doc.splitTextToSize(letter, usableWidth);
		let y = marginY;
		const lineHeight = 15;
		for (const line of lines) {
			if (y > pageHeight - marginY) {
				doc.addPage();
				y = marginY;
			}
			doc.text(line, marginX, y);
			y += lineHeight;
		}
		const safeCompany = (company || "cover-letter").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "cover-letter";
		doc.save(`${safeCompany}.pdf`);
	}
	function downloadPdf() {
		try {
			buildPdf();
		} catch (e) {
			toast.error(e instanceof Error ? e.message : "PDF download failed");
		}
	}
	const safeName = (company || "cover-letter").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "cover-letter";
	async function buildDocx() {
		const doc = new File({ sections: [{
			properties: { page: {
				size: {
					width: 12240,
					height: 15840
				},
				margin: {
					top: 1440,
					right: 1440,
					bottom: 1440,
					left: 1440
				}
			} },
			children: letter.split(/\n/).map((line) => new Paragraph({ children: [new TextRun({
				text: line,
				font: "Calibri",
				size: 22
			})] }))
		}] });
		const blob = await Packer.toBlob(doc);
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `${safeName}.docx`;
		document.body.appendChild(a);
		a.click();
		a.remove();
		URL.revokeObjectURL(url);
	}
	async function downloadDocx() {
		try {
			await buildDocx();
		} catch (e) {
			toast.error(e instanceof Error ? e.message : "DOCX download failed");
		}
	}
	async function copyLetter() {
		try {
			await navigator.clipboard.writeText(letter);
			toast.success("Copied");
		} catch (e) {
			toast.error(e instanceof Error ? e.message : "Could not copy");
		}
	}
	const RegenerateButton = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenu, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuTrigger, {
		asChild: true,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
			size: "sm",
			variant: "outline",
			disabled: regenerateDisabled || isRegenerating,
			children: [isRegenerating ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-1 h-3.5 w-3.5 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "mr-1 h-3.5 w-3.5" }), "Regenerate"]
		})
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuContent, {
		align: "end",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuItem, {
			onClick: () => onRegenerate(void 0),
			children: "Balanced"
		}), tones.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuItem, {
			onClick: () => onRegenerate(t.key),
			children: t.label
		}, t.key))]
	})] });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-lg border border-border bg-card",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-col gap-3 border-b border-border px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "text-sm font-semibold text-foreground",
				children: "Cover letter"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						size: "sm",
						variant: "outline",
						onClick: copyLetter,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, { className: "mr-1 h-3.5 w-3.5" }), "Copy"]
					}),
					RegenerateButton,
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						size: "sm",
						variant: "outline",
						onClick: downloadPdf,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "mr-1 h-3.5 w-3.5" }), "PDF"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						size: "sm",
						variant: "outline",
						onClick: downloadDocx,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "mr-1 h-3.5 w-3.5" }), "DOCX"]
					})
				]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "px-5 py-5",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "whitespace-pre-wrap text-sm leading-relaxed text-foreground",
				children: letter
			})
		})]
	});
}
//#endregion
export { TailorPage as component };
