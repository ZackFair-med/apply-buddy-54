import { P as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { n as buttonVariants, r as cn } from "./button-PwNqyxv_.mjs";
import { a as AlertDialogDescription, c as AlertDialogTitle, i as AlertDialogContent, n as AlertDialogAction, o as AlertDialogFooter, r as AlertDialogCancel, s as AlertDialogHeader, t as AlertDialog } from "./alert-dialog-Bz_ok53Q.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/ConfirmDialog-fZSWgi3a.js
var import_jsx_runtime = require_jsx_runtime();
function ConfirmDialog({ open, onOpenChange, title, description, confirmLabel = "Confirm", cancelLabel = "Cancel", destructive = false, loading = false, onConfirm }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogTitle, { children: title }), description && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogDescription, { children: description })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogCancel, {
			disabled: loading,
			children: cancelLabel
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogAction, {
			disabled: loading,
			onClick: (e) => {
				e.preventDefault();
				onConfirm();
			},
			className: cn(destructive && buttonVariants({ variant: "destructive" })),
			children: loading ? "Working…" : confirmLabel
		})] })] })
	});
}
//#endregion
export { ConfirmDialog as t };
