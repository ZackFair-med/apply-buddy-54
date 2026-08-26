import { o as __toESM } from "../_runtime.mjs";
import { g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { l as createServerFn } from "./esm-9EjmF9OT.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { P as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { n as useServerFn, t as createSsrRpc } from "./createSsrRpc-C19MdsU6.mjs";
import { t as Button } from "./button-Dts1Y2ez.mjs";
import { n as CardContent, t as Card } from "./card-Cyf-osIi.mjs";
import { A as ArrowUpDown, o as Sparkles } from "../_libs/lucide-react.mjs";
import { t as requireSupabaseAuth } from "./auth-middleware-B3XILrvZ.mjs";
import { n as useQuery } from "../_libs/tanstack__react-query.mjs";
import { t as Badge } from "./badge-DL6jAwQF.mjs";
import { a as TableHeader, i as TableHead, n as TableBody, o as TableRow, r as TableCell, t as Table } from "./table-C0jdnqQY.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/history-LkNcapz4.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var listMatchHistory = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(createSsrRpc("a9a60f4ab318fbfaeb24adc4dddd7ada313bd53fc3ee25029c7aa5552b742d64"));
function HistoryPage() {
	const fn = useServerFn(listMatchHistory);
	const { data, isLoading } = useQuery({
		queryKey: ["match-history"],
		queryFn: () => fn()
	});
	const [sortKey, setSortKey] = (0, import_react.useState)("date");
	const [asc, setAsc] = (0, import_react.useState)(false);
	const items = (0, import_react.useMemo)(() => {
		const arr = [...data?.items ?? []];
		arr.sort((a, b) => {
			const v = sortKey === "score" ? a.match_score - b.match_score : new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
			return asc ? v : -v;
		});
		return arr;
	}, [
		data,
		sortKey,
		asc
	]);
	const toggle = (k) => {
		if (sortKey === k) setAsc((v) => !v);
		else {
			setSortKey(k);
			setAsc(k === "date" ? false : false);
		}
	};
	if (isLoading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "text-sm text-muted-foreground",
		children: "Loading history…"
	});
	if (data && !data.paid) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PaidOnlyEmptyState, {});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "font-serif text-3xl",
			children: "Match History"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm text-muted-foreground",
			children: "Every match analysis you've run, so you can compare which jobs fit best."
		})] }), items.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
			className: "py-10 text-center text-sm text-muted-foreground",
			children: "No matches yet. Run an analysis from the AI Assistant to start building your history."
		}) }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
			className: "p-0",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					className: "inline-flex items-center gap-1",
					onClick: () => toggle("score"),
					children: ["Score ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUpDown, { className: "h-3.5 w-3.5" })]
				}) }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Position" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Company" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "CV" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					className: "inline-flex items-center gap-1",
					onClick: () => toggle("date"),
					children: ["Date ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUpDown, { className: "h-3.5 w-3.5" })]
				}) })
			] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableBody, { children: items.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, { m }, m.id)) })] })
		}) })]
	});
}
function Row({ m }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
			className: `font-serif text-xl ${m.match_score >= 75 ? "text-emerald-700" : m.match_score >= 50 ? "text-primary" : "text-destructive"}`,
			children: m.match_score
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
			className: "font-medium",
			children: m.job_title || /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-muted-foreground",
				children: "—"
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: m.company || /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-muted-foreground",
			children: "—"
		}) }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: m.cv_label ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
			variant: "secondary",
			children: m.cv_label
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-muted-foreground",
			children: "—"
		}) }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
			className: "text-sm text-muted-foreground",
			children: new Date(m.created_at).toLocaleDateString(void 0, {
				year: "numeric",
				month: "short",
				day: "numeric"
			})
		})
	] });
}
function PaidOnlyEmptyState() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "font-serif text-3xl",
			children: "Match History"
		}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
			className: "flex flex-col items-center gap-4 py-12 text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "h-6 w-6" })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "max-w-md space-y-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-serif text-xl",
						children: "A paid feature"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted-foreground",
						children: "Paid plans save every match analysis so you can compare which jobs you fit best over time."
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					asChild: true,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/profile",
						children: "Upgrade"
					})
				})
			]
		}) })]
	});
}
//#endregion
export { HistoryPage as component };
