import { P as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as Button } from "./button-Dts1Y2ez.mjs";
import { n as CardContent, t as Card } from "./card-Cyf-osIi.mjs";
import { o as Sparkles, t as X } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/UpgradePrompt-CmGIYmfn.js
var import_jsx_runtime = require_jsx_runtime();
var COPY = {
	match_score: {
		title: "You've used today's free match scores",
		body: "Free plan includes 10 match analyses per day. Upgrade for unlimited daily match scores plus keyword extraction."
	},
	keywords: {
		title: "You've used today's free keyword runs",
		body: "Free plan includes 10 CV improvement runs per day. Upgrade for unlimited keyword analysis across every job."
	},
	cover_letter: {
		title: "You've used today's free cover letters",
		body: "Free plan includes 5 cover letters per day. Upgrade for 15/day plus tone regeneration and PDF export."
	},
	cv_profiles: {
		title: "You've reached your CV limit",
		body: "Free plan stores up to 3 CVs. Upgrade to keep up to 5 CV profiles."
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
//#endregion
export { UpgradePrompt as t };
