import { P as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/ApplyPilotLogo-BD61uhC_.js
var import_jsx_runtime = require_jsx_runtime();
function LogoMark({ className = "h-9 w-9" }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
		"aria-hidden": "true",
		viewBox: "0 0 48 48",
		className,
		fill: "none",
		xmlns: "http://www.w3.org/2000/svg",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
				width: "48",
				height: "48",
				rx: "12",
				fill: "#1F4D3D"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: "M12.5 34.5 23.5 12l11 22.5M17.1 26h12.8",
				stroke: "#FBFBF9",
				strokeWidth: "3.4",
				strokeLinecap: "round",
				strokeLinejoin: "round"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: "M26.5 16.5c5.4.2 8.4-1.8 10.2-5.2",
				stroke: "#D2A663",
				strokeWidth: "2.4",
				strokeLinecap: "round"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: "m34.1 10.4 4.5-1.1-1.2 4.5",
				fill: "#D2A663"
			})
		]
	});
}
function ApplyPilotLogo({ showWordmark = true, markClassName, wordmarkClassName, className = "", ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		className: `inline-flex items-center gap-2.5 ${className}`,
		"aria-label": "ApplyPilot",
		...props,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogoMark, { className: markClassName }), showWordmark && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: `font-serif text-xl font-semibold tracking-[-0.025em] ${wordmarkClassName ?? ""}`,
			children: "ApplyPilot"
		})]
	});
}
//#endregion
export { LogoMark as n, ApplyPilotLogo as t };
