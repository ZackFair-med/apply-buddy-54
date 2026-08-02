import { I as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as Button } from "./button-PwNqyxv_.mjs";
import { n as CardContent, t as Card } from "./card-C5Nmk_bj.mjs";
import { o as Sparkles, t as X } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/UsageIndicator-WYOYl6eJ.js
var import_jsx_runtime = require_jsx_runtime();
var COPY = {
	match_score: {
		title: "You've used today's free match scores",
		body: "Free plan includes 3 match analyses per day. Upgrade for unlimited daily match scores plus keyword extraction."
	},
	keywords: {
		title: "You've used today's free keyword runs",
		body: "Free plan includes 2 keyword extractions per day. Upgrade for unlimited keyword analysis across every job."
	},
	cover_letter: {
		title: "You've used this week's free cover letter",
		body: "Free plan includes 1 cover letter per week. Upgrade for 15/day plus tone regeneration and PDF export."
	},
	cv_profiles: {
		title: "You've reached your CV limit",
		body: "Free plan stores 1 CV. Upgrade to keep up to 5 tailored CV versions."
	}
};
function UpgradePrompt({ feature, onDismiss, onUpgrade }) {
	const copy = COPY[feature];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
		className: "border-primary/30 bg-primary/5",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
			className: "flex items-start gap-3 py-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-0.5 rounded-md bg-primary/10 p-2 text-primary",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "h-4 w-4" })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex-1 space-y-1",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "font-medium",
							children: copy.title
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted-foreground",
							children: copy.body
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex gap-2 pt-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								onClick: onUpgrade,
								children: "Upgrade to Paid"
							}), onDismiss && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: "ghost",
								onClick: onDismiss,
								children: "Not now"
							})]
						})
					]
				}),
				onDismiss && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					"aria-label": "Dismiss",
					onClick: onDismiss,
					className: "text-muted-foreground hover:text-foreground",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-4 w-4" })
				})
			]
		})
	});
}
function UsageIndicator({ used, limit, unit, window }) {
	if (limit == null) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		className: "text-xs text-muted-foreground",
		children: ["Unlimited ", unit]
	});
	const left = Math.max(0, limit - used);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		className: `text-xs ${left === 0 ? "text-destructive" : left <= 1 ? "text-amber-700" : "text-muted-foreground"}`,
		children: [
			left,
			" of ",
			limit,
			" ",
			unit,
			" left",
			window ? ` ${window === "day" ? "today" : "this week"}` : ""
		]
	});
}
//#endregion
export { UsageIndicator as n, UpgradePrompt as t };
