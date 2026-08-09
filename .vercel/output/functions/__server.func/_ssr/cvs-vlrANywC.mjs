import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { P as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { n as useServerFn } from "./createSsrRpc-kxl7ZP70.mjs";
import { t as Button } from "./button-PwNqyxv_.mjs";
import { t as Input } from "./input-uzm9g8Y7.mjs";
import { t as Label } from "./label-BeT0bXvu.mjs";
import { n as CardContent, t as Card } from "./card-C5Nmk_bj.mjs";
import { c as Pencil, g as FileText, i as Trash2, r as Upload, v as Download } from "../_libs/lucide-react.mjs";
import { a as DialogTitle, i as DialogHeader, n as DialogContent, r as DialogFooter, t as Dialog } from "./dialog-BniXEkcE.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { a as uploadCv, i as updateCv, n as downloadCv, r as listCvs, t as deleteCv } from "./cvs.functions-7ghy875C.mjs";
import { t as getUsageSummary } from "./usage.functions-oTOmtUpQ.mjs";
import { t as Badge } from "./badge-B3f60TId.mjs";
import { a as TableHeader, i as TableHead, n as TableBody, o as TableRow, r as TableCell, t as Table } from "./table-BcaWptOW.mjs";
import { t as ConfirmDialog } from "./ConfirmDialog-fZSWgi3a.mjs";
import { n as UsageIndicator, t as UpgradePrompt } from "./UsageIndicator-WYOYl6eJ.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/cvs-vlrANywC.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function fileToBase64(file) {
	return new Promise((resolve, reject) => {
		const r = new FileReader();
		r.onload = () => {
			const s = r.result;
			resolve(s.split(",")[1] ?? "");
		};
		r.onerror = () => reject(r.error);
		r.readAsDataURL(file);
	});
}
function formatDate(d) {
	if (!d) return null;
	try {
		return new Date(d).toLocaleDateString(void 0, {
			year: "numeric",
			month: "short",
			day: "numeric"
		});
	} catch {
		return d;
	}
}
function CvsPage() {
	const qc = useQueryClient();
	const list = useServerFn(listCvs);
	const upload = useServerFn(uploadCv);
	const remove = useServerFn(deleteCv);
	const download = useServerFn(downloadCv);
	const update = useServerFn(updateCv);
	const usageFn = useServerFn(getUsageSummary);
	const { data: cvs = [], isLoading } = useQuery({
		queryKey: ["cvs"],
		queryFn: () => list()
	});
	const { data: usage, refetch: refetchUsage } = useQuery({
		queryKey: ["usage-summary"],
		queryFn: () => usageFn()
	});
	const [label, setLabel] = (0, import_react.useState)("");
	const [tags, setTags] = (0, import_react.useState)("");
	const [file, setFile] = (0, import_react.useState)(null);
	const [confirmDeleteId, setConfirmDeleteId] = (0, import_react.useState)(null);
	const [downloadingId, setDownloadingId] = (0, import_react.useState)(null);
	const [editing, setEditing] = (0, import_react.useState)(null);
	const [showUpgrade, setShowUpgrade] = (0, import_react.useState)(false);
	const uploadMut = useMutation({
		mutationFn: async () => {
			if (!file) throw new Error("Pick a file");
			const base64 = await fileToBase64(file);
			return upload({ data: {
				label,
				tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
				fileName: file.name,
				mimeType: file.type || (file.name.endsWith(".pdf") ? "application/pdf" : "application/vnd.openxmlformats-officedocument.wordprocessingml.document"),
				base64
			} });
		},
		onSuccess: (row) => {
			if (row?.limitReached) {
				setShowUpgrade(true);
				return;
			}
			setShowUpgrade(false);
			toast.success(row.parse_error ? `Uploaded (parse failed: ${row.parse_error})` : "Uploaded and parsed");
			setLabel("");
			setTags("");
			setFile(null);
			qc.invalidateQueries({ queryKey: ["cvs"] });
			refetchUsage();
		},
		onError: (e) => toast.error(e instanceof Error ? e.message : "Upload failed")
	});
	const deleteMut = useMutation({
		mutationFn: (id) => remove({ data: { id } }),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["cvs"] });
			refetchUsage();
			toast.success("CV deleted");
			setConfirmDeleteId(null);
		},
		onError: (e) => toast.error(e instanceof Error ? e.message : "Delete failed")
	});
	const updateMut = useMutation({
		mutationFn: (payload) => update({ data: payload }),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["cvs"] });
			toast.success("CV updated");
			setEditing(null);
		},
		onError: (e) => toast.error(e instanceof Error ? e.message : "Update failed")
	});
	const handleDownload = async (id) => {
		setDownloadingId(id);
		try {
			const { url, fileName } = await download({ data: { id } });
			const res = await fetch(url);
			if (!res.ok) throw new Error("Could not fetch file");
			const blob = await res.blob();
			const objectUrl = URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = objectUrl;
			a.download = fileName;
			document.body.appendChild(a);
			a.click();
			a.remove();
			URL.revokeObjectURL(objectUrl);
		} catch (e) {
			toast.error(e instanceof Error ? e.message : "Download failed");
		} finally {
			setDownloadingId(null);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-serif text-3xl",
				children: "CVs"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground",
				children: "Upload PDF or DOCX. Text is extracted once and reused by the tailor."
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
				className: "space-y-3 py-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-3 sm:grid-cols-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Label" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: label,
								onChange: (e) => setLabel(e.target.value),
								placeholder: "e.g. Product Manager v3"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Tags (comma-separated)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: tags,
								onChange: (e) => setTags(e.target.value),
								placeholder: "pm, product, startup"
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "File" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							type: "file",
							accept: ".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document",
							onChange: (e) => setFile(e.target.files?.[0] ?? null)
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							onClick: () => uploadMut.mutate(),
							disabled: !file || !label || uploadMut.isPending,
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Upload, { className: "mr-1 h-4 w-4" }),
								" ",
								uploadMut.isPending ? "Uploading…" : "Upload"
							]
						}), usage && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UsageIndicator, {
							used: usage.cvProfiles.used,
							limit: usage.cvProfiles.limit,
							unit: "CV slots"
						})]
					})
				]
			}) }),
			showUpgrade && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UpgradePrompt, {
				feature: "cv_profiles",
				onDismiss: () => setShowUpgrade(false),
				onUpgrade: () => toast.info("Upgrade flow coming soon")
			}),
			isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground",
				children: "Loading…"
			}) : cvs.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
				className: "py-12 text-center text-muted-foreground",
				children: "No CVs yet."
			}) }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "rounded-lg border bg-card overflow-hidden",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "overflow-x-auto",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, {
						className: "bg-muted/40 hover:bg-muted/40",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
								className: "min-w-[200px]",
								children: "Label"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
								className: "min-w-[160px]",
								children: "File"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
								className: "min-w-[160px]",
								children: "Tags"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
								className: "min-w-[120px]",
								children: "Date uploaded"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
								className: "w-[120px] text-right",
								children: "Actions"
							})
						]
					}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableBody, { children: cvs.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "font-medium",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "h-4 w-4 shrink-0 text-muted-foreground" }), c.label]
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "text-sm text-muted-foreground truncate max-w-[200px]",
							children: c.file_name
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex flex-wrap gap-1",
							children: c.tags?.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								variant: "secondary",
								children: t
							}, t))
						}) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "text-sm text-muted-foreground whitespace-nowrap",
							children: formatDate(c.created_at) ?? "—"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "text-right",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex justify-end gap-1",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "icon",
										variant: "ghost",
										title: "Edit",
										onClick: () => setEditing({
											id: c.id,
											label: c.label,
											tags: (c.tags ?? []).join(", ")
										}),
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "h-4 w-4" })
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "icon",
										variant: "ghost",
										title: "Download",
										disabled: downloadingId === c.id,
										onClick: () => handleDownload(c.id),
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "h-4 w-4" })
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "icon",
										variant: "ghost",
										title: "Delete",
										onClick: () => setConfirmDeleteId(c.id),
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-4 w-4" })
									})
								]
							})
						})
					] }, c.id)) })] })
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConfirmDialog, {
				open: !!confirmDeleteId,
				onOpenChange: (o) => {
					if (!o) setConfirmDeleteId(null);
				},
				title: "Delete this CV?",
				description: "The file and its parsed text will be permanently removed.",
				confirmLabel: "Delete",
				destructive: true,
				loading: deleteMut.isPending,
				onConfirm: () => confirmDeleteId && deleteMut.mutate(confirmDeleteId)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: !!editing,
				onOpenChange: (o) => {
					if (!o) setEditing(null);
				},
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Edit CV" }) }),
					editing && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Label" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: editing.label,
								onChange: (e) => setEditing({
									...editing,
									label: e.target.value
								})
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Tags (comma-separated)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: editing.tags,
								onChange: (e) => setEditing({
									...editing,
									tags: e.target.value
								}),
								placeholder: "pm, product, startup"
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						onClick: () => setEditing(null),
						children: "Cancel"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						disabled: !editing?.label.trim() || updateMut.isPending,
						onClick: () => editing && updateMut.mutate({
							id: editing.id,
							label: editing.label.trim(),
							tags: editing.tags.split(",").map((t) => t.trim()).filter(Boolean)
						}),
						children: updateMut.isPending ? "Saving…" : "Save"
					})] })
				] })
			})
		]
	});
}
//#endregion
export { CvsPage as component };
