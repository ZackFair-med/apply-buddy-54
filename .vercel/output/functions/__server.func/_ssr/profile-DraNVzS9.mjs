import { o as __toESM } from "../_runtime.mjs";
import { _ as useRouter } from "../_libs/@tanstack/react-router+[...].mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { P as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { n as useServerFn } from "./createSsrRpc-C19MdsU6.mjs";
import { t as Button } from "./button-Dts1Y2ez.mjs";
import { t as Input } from "./input-B2ae_v7j.mjs";
import { t as Label } from "./label-atB1Bfyt.mjs";
import { a as CardTitle, i as CardHeader, n as CardContent, r as CardDescription, t as Card } from "./card-Cyf-osIi.mjs";
import { f as LoaderCircle } from "../_libs/lucide-react.mjs";
import { n as getProfile, r as updateProfile, t as deleteAccount } from "./profile.functions-BG2aaBM4.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as supabase } from "./client-C1nPdEEu.mjs";
import { a as AlertDialogDescription, c as AlertDialogTitle, i as AlertDialogContent, l as AlertDialogTrigger, n as AlertDialogAction, o as AlertDialogFooter, r as AlertDialogCancel, s as AlertDialogHeader, t as AlertDialog } from "./alert-dialog-DTGrMTHv.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/profile-DraNVzS9.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ProfilePage() {
	const qc = useQueryClient();
	const router = useRouter();
	const getFn = useServerFn(getProfile);
	const updateFn = useServerFn(updateProfile);
	const deleteFn = useServerFn(deleteAccount);
	const { data: profile, isLoading } = useQuery({
		queryKey: ["profile"],
		queryFn: () => getFn()
	});
	const [firstName, setFirstName] = (0, import_react.useState)("");
	const [lastName, setLastName] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		if (profile) {
			setFirstName(profile.first_name ?? "");
			setLastName(profile.last_name ?? "");
		}
	}, [profile]);
	const saveInfo = useMutation({
		mutationFn: () => updateFn({ data: {
			first_name: firstName.trim(),
			last_name: lastName.trim(),
			display_name: [firstName.trim(), lastName.trim()].filter(Boolean).join(" ") || null
		} }),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["profile"] });
			toast.success("Profile updated");
		},
		onError: (e) => toast.error(e.message)
	});
	const [newPassword, setNewPassword] = (0, import_react.useState)("");
	const [confirmPassword, setConfirmPassword] = (0, import_react.useState)("");
	const changePassword = useMutation({
		mutationFn: async () => {
			if (newPassword.length < 8) throw new Error("Password must be at least 8 characters");
			if (newPassword !== confirmPassword) throw new Error("Passwords do not match");
			const { error } = await supabase.auth.updateUser({ password: newPassword });
			if (error) throw new Error(error.message);
		},
		onSuccess: () => {
			setNewPassword("");
			setConfirmPassword("");
			toast.success("Password updated");
		},
		onError: (e) => toast.error(e.message)
	});
	const [confirmText, setConfirmText] = (0, import_react.useState)("");
	const deleteMut = useMutation({
		mutationFn: () => deleteFn(),
		onSuccess: async () => {
			const { error } = await supabase.auth.signOut();
			if (error) console.error("[profile.deleteAccount] sign out failed:", error);
			qc.clear();
			toast.success("Account deleted");
			router.navigate({ to: "/auth" });
		},
		onError: (e) => toast.error(e.message)
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-xl space-y-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "font-serif text-3xl font-semibold tracking-tight",
			children: "Profile"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm text-muted-foreground",
			children: "Manage your account details."
		})] }), isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-2 text-sm text-muted-foreground",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 animate-spin" }), " Loading…"]
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
				className: "text-base",
				children: "Member information"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Your name and account email." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
				className: "space-y-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-1 gap-4 sm:grid-cols-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "first_name",
								children: "First name"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "first_name",
								value: firstName,
								onChange: (e) => setFirstName(e.target.value),
								placeholder: "Jane",
								maxLength: 100
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "last_name",
								children: "Last name"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "last_name",
								value: lastName,
								onChange: (e) => setLastName(e.target.value),
								placeholder: "Doe",
								maxLength: 100
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Email" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: profile?.email ?? "",
							disabled: true
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex justify-end",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							onClick: () => saveInfo.mutate(),
							disabled: saveInfo.isPending,
							children: [saveInfo.isPending && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-2 h-4 w-4 animate-spin" }), "Save changes"]
						})
					})
				]
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
				className: "text-base",
				children: "Change password"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Use at least 8 characters." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
				className: "space-y-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "new_password",
							children: "New password"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "new_password",
							type: "password",
							value: newPassword,
							onChange: (e) => setNewPassword(e.target.value),
							autoComplete: "new-password"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "confirm_password",
							children: "Confirm new password"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "confirm_password",
							type: "password",
							value: confirmPassword,
							onChange: (e) => setConfirmPassword(e.target.value),
							autoComplete: "new-password"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex justify-end",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							onClick: () => changePassword.mutate(),
							disabled: changePassword.isPending || !newPassword || !confirmPassword,
							children: [changePassword.isPending && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-2 h-4 w-4 animate-spin" }), "Update password"]
						})
					})
				]
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "border-destructive/40",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
					className: "text-base text-destructive",
					children: "Delete account"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Permanently delete your account and all your data. This cannot be undone." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
					className: "flex justify-end",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialog, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogTrigger, {
						asChild: true,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "destructive",
							children: "Delete account"
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogContent, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogTitle, { children: "Delete your account?" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogDescription, { children: [
							"This will permanently erase your profile, jobs, CVs, and tailor history. Type ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-semibold",
								children: "DELETE"
							}),
							" to confirm."
						] })] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: confirmText,
							onChange: (e) => setConfirmText(e.target.value),
							placeholder: "DELETE"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogCancel, {
							onClick: () => setConfirmText(""),
							children: "Cancel"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogAction, {
							disabled: confirmText !== "DELETE" || deleteMut.isPending,
							onClick: (e) => {
								e.preventDefault();
								deleteMut.mutate();
							},
							children: [deleteMut.isPending && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-2 h-4 w-4 animate-spin" }), "Permanently delete"]
						})] })
					] })] })
				})]
			})
		] })]
	});
}
//#endregion
export { ProfilePage as component };
