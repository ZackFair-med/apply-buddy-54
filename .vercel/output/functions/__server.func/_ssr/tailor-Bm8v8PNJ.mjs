import { o as __toESM } from "../_runtime.mjs";
import { c as createServerFn } from "./createServerFn-BFFE07zL.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { I as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { n as useServerFn, t as createSsrRpc } from "./createSsrRpc-BfwDcJiR.mjs";
import { r as cn, t as Button } from "./button-PwNqyxv_.mjs";
import { t as Input } from "./input-uzm9g8Y7.mjs";
import { t as Label } from "./label-BeT0bXvu.mjs";
import { a as CardTitle, i as CardHeader, n as CardContent, t as Card } from "./card-C5Nmk_bj.mjs";
import { C as ChevronRight, T as Check, a as Tags, d as LoaderCircle, g as FileText, h as Gauge, o as Sparkles, v as Download, x as Circle, y as Copy } from "../_libs/lucide-react.mjs";
import { t as requireSupabaseAuth } from "./auth-middleware-7KFL4zEp.mjs";
import { i as objectType, n as enumType, o as stringType } from "../_libs/zod.mjs";
import { n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { r as listCvs } from "./cvs.functions-BALbgz3R.mjs";
import { t as getUsageSummary } from "./usage.functions-HrN4kXck.mjs";
import { t as Badge } from "./badge-B3f60TId.mjs";
import { n as UsageIndicator, t as UpgradePrompt } from "./UsageIndicator-WYOYl6eJ.mjs";
import { a as Label2, c as Root2, d as SubTrigger2, f as Trigger, i as ItemIndicator2, l as Separator2, n as Content2, o as Portal2, r as Item2, s as RadioItem2, t as CheckboxItem2, u as SubContent2 } from "../_libs/@radix-ui/react-dropdown-menu+[...].mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, o as Textarea, r as SelectItem, t as Select } from "./select-B_ezB_KN.mjs";
import { i as TooltipTrigger, n as TooltipContent, r as TooltipProvider, t as Tooltip } from "./tooltip-UfIeK6c9.mjs";
import { n as Root, t as Indicator } from "../_libs/radix-ui__react-progress.mjs";
import { t as require_jspdf_node_min } from "../_libs/jspdf.mjs";
import { i as TextRun, n as Packer, r as Paragraph, t as File } from "../_libs/docx.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/tailor-Bm8v8PNJ.js
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
var analyzeMatch = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((d) => inputSchema.parse(d)).handler(createSsrRpc("4abacc882bd13bcdc7a0a5dcb68d2f908b598dee19711ba74816a9bf895ce960"));
var extractKeywords = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((d) => inputSchema.parse(d)).handler(createSsrRpc("8ca2404dc8aefb21eebf56d676fd57337f9420879476ad174be364776cfe7a32"));
var generateCoverLetter = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((d) => letterInputSchema.parse(d)).handler(createSsrRpc("db1ed20c317dc9f90eff319ec6aa929a298d1332e777ffd1bdd52a5215228f82"));
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
	const [analysis, setAnalysis] = (0, import_react.useState)(null);
	const [keywords, setKeywords] = (0, import_react.useState)(null);
	const [letter, setLetter] = (0, import_react.useState)(null);
	const [upgrade, setUpgrade] = (0, import_react.useState)(null);
	const payload = () => ({
		cvId,
		jobDescription: jd,
		jobTitle: title || void 0,
		company: company || void 0
	});
	const handleResult = (feature, onSuccess, errLabel) => ({
		onSuccess: (r) => {
			if (r?.limitReached) {
				setUpgrade(feature);
				return;
			}
			setUpgrade((prev) => prev === feature ? null : prev);
			onSuccess(r);
			refetchUsage();
		},
		onError: (e) => toast.error(e instanceof Error ? e.message : errLabel)
	});
	const runAnalyze = useMutation({
		mutationFn: () => analyzeFn({ data: payload() }),
		...handleResult("match_score", (r) => setAnalysis(r), "Analysis failed")
	});
	const runKeywords = useMutation({
		mutationFn: () => keywordsFn({ data: payload() }),
		...handleResult("keywords", (r) => setKeywords(r), "Keyword extraction failed")
	});
	const runLetter = useMutation({
		mutationFn: (tone) => letterFn({ data: {
			...payload(),
			tone
		} }),
		...handleResult("cover_letter", (r) => setLetter(r.coverLetter), "Cover letter failed")
	});
	const disabled = !cvId || jd.length < 30;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-serif text-4xl leading-tight text-foreground",
					children: "AI Assistant"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-base text-muted-foreground",
					children: "Pick a CV, paste a job description, then run only what you need — score, keywords, or cover letter."
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
				className: "space-y-4 py-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-4 sm:grid-cols-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-2 sm:col-span-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									className: "text-sm font-medium text-foreground",
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
								className: "space-y-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									className: "text-sm font-medium text-foreground",
									children: "Job title (optional)"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									value: title,
									onChange: (e) => setTitle(e.target.value)
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									className: "text-sm font-medium text-foreground",
									children: "Company (optional)"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									value: company,
									onChange: (e) => setCompany(e.target.value)
								})]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							className: "text-sm font-medium text-foreground",
							children: "Job description"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
							rows: 8,
							value: jd,
							onChange: (e) => setJd(e.target.value),
							placeholder: "Paste the full job posting here…"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-4 pt-2 sm:grid-cols-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-col items-start gap-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									variant: "default",
									onClick: () => runAnalyze.mutate(),
									disabled: disabled || runAnalyze.isPending,
									children: [runAnalyze.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-1 h-4 w-4 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Gauge, { className: "mr-1 h-4 w-4" }), analysis ? "Re-analyze match" : "Analyze match"]
								}), usage && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UsageIndicator, {
									used: usage.matchScore.used,
									limit: usage.matchScore.limit,
									unit: "match scores",
									window: "day"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-col items-start gap-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									variant: "outline",
									onClick: () => runKeywords.mutate(),
									disabled: disabled || runKeywords.isPending,
									children: [runKeywords.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-1 h-4 w-4 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tags, { className: "mr-1 h-4 w-4" }), keywords ? "Re-run keywords" : "Suggest keywords"]
								}), usage && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UsageIndicator, {
									used: usage.keywords.used,
									limit: usage.keywords.limit,
									unit: "keyword runs",
									window: "day"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-col items-start gap-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									variant: "outline",
									onClick: () => runLetter.mutate(void 0),
									disabled: disabled || runLetter.isPending,
									children: [runLetter.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-1 h-4 w-4 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "mr-1 h-4 w-4" }), letter ? "Rewrite cover letter" : "Write cover letter"]
								}), usage && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UsageIndicator, {
									used: usage.coverLetter.used,
									limit: usage.coverLetter.limit,
									unit: "cover letters",
									window: usage.coverLetter.window
								})]
							})
						]
					})
				]
			}) }),
			upgrade && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UpgradePrompt, {
				feature: upgrade,
				onDismiss: () => setUpgrade(null),
				onUpgrade: () => toast.info("Upgrade flow coming soon")
			}),
			analysis && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnalysisView, {
				analysis,
				isPaid: usage?.plan === "paid"
			}),
			keywords && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeywordsView, { keywords }),
			letter && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LetterView, {
				letter,
				isPaid: usage?.plan === "paid",
				onRegenerate: (tone) => runLetter.mutate(tone),
				isRegenerating: runLetter.isPending,
				company
			})
		]
	});
}
function AnalysisView({ analysis, isPaid }) {
	const scoreColor = analysis.matchScore >= 75 ? "text-emerald-700" : analysis.matchScore >= 50 ? "text-primary" : "text-destructive";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
				className: "py-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-baseline justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "font-serif text-base text-foreground",
						children: "Match score"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: `font-serif text-6xl leading-none ${scoreColor}`,
						children: analysis.matchScore
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-sm text-muted-foreground",
						children: "/ 100"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Progress, {
					value: analysis.matchScore,
					className: "mt-4"
				})]
			}) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-6 md:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
					className: "font-serif text-base text-foreground",
					children: "Strengths"
				}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "list-disc space-y-1 pl-5 text-sm",
					children: analysis.strengths.map((s, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: s }, i))
				}) })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
					className: "font-serif text-base text-foreground",
					children: "Weaknesses"
				}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "list-disc space-y-1 pl-5 text-sm",
					children: analysis.weaknesses.map((s, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: s }, i))
				}) })] })]
			}),
			!isPaid && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-xs text-muted-foreground",
				children: [
					"Paid plans save your match history so you can compare jobs later.",
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
function KeywordsView({ keywords }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-6 md:grid-cols-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
			className: "font-serif text-base text-foreground",
			children: "Matched keywords"
		}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
			className: "flex flex-wrap gap-1.5",
			children: keywords.matchedKeywords.map((k) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
				variant: "secondary",
				children: k
			}, k))
		})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
			className: "font-serif text-base text-foreground",
			children: "Missing keywords"
		}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
			className: "flex flex-wrap gap-1.5",
			children: keywords.missingKeywords.map((k) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
				variant: "outline",
				children: k
			}, k))
		})] })]
	});
}
function LetterView({ letter, isPaid, onRegenerate, isRegenerating, company }) {
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
			toast.error(e instanceof Error ? e.message : "Could not copy to clipboard");
		}
	}
	const RegenerateButton = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenu, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuTrigger, {
		asChild: true,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
			size: "sm",
			variant: "outline",
			disabled: !isPaid || isRegenerating,
			children: [isRegenerating ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-1 h-3.5 w-3.5 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "mr-1 h-3.5 w-3.5" }), "Regenerate with tone"]
		})
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuContent, {
		align: "end",
		children: tones.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuItem, {
			onClick: () => onRegenerate(t.key),
			children: t.label
		}, t.key))
	})] });
	const DownloadPdfButton = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
		size: "sm",
		variant: "outline",
		disabled: !isPaid,
		onClick: downloadPdf,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "mr-1 h-3.5 w-3.5" }), " PDF"]
	});
	const DownloadDocxButton = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
		size: "sm",
		variant: "outline",
		disabled: !isPaid,
		onClick: downloadDocx,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "mr-1 h-3.5 w-3.5" }), " DOCX"]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
		className: "flex-row items-center justify-between gap-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
			className: "font-serif text-base text-foreground",
			children: "Cover letter"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				size: "sm",
				variant: "outline",
				onClick: copyLetter,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, { className: "mr-1 h-3.5 w-3.5" }), " Copy"]
			}), isPaid ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				RegenerateButton,
				DownloadPdfButton,
				DownloadDocxButton
			] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TooltipProvider, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tooltip, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipTrigger, {
					asChild: true,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						tabIndex: 0,
						children: RegenerateButton
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipContent, { children: "Upgrade to regenerate with different tones" })] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tooltip, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipTrigger, {
					asChild: true,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						tabIndex: 0,
						children: DownloadPdfButton
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipContent, { children: "Upgrade to download as PDF" })] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tooltip, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipTrigger, {
					asChild: true,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						tabIndex: 0,
						children: DownloadDocxButton
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipContent, { children: "Upgrade to download as DOCX" })] })
			] })]
		})]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "whitespace-pre-wrap text-sm leading-relaxed",
		children: letter
	}) })] });
}
//#endregion
export { TailorPage as component };
