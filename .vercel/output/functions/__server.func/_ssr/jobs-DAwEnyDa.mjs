import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { I as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { n as useServerFn } from "./createSsrRpc-BfwDcJiR.mjs";
import { r as cn, t as Button } from "./button-PwNqyxv_.mjs";
import { t as Input } from "./input-uzm9g8Y7.mjs";
import { t as Label } from "./label-BeT0bXvu.mjs";
import { n as CardContent, t as Card } from "./card-C5Nmk_bj.mjs";
import { E as CalendarDays, T as Check, _ as ExternalLink, b as Clock, c as Pencil, g as FileText, i as Trash2, s as Plus } from "../_libs/lucide-react.mjs";
import { a as DialogTitle, i as DialogHeader, n as DialogContent, o as DialogTrigger, r as DialogFooter, t as Dialog } from "./dialog-BniXEkcE.mjs";
import { a as updateJob, i as listJobs, n as deleteJob, o as updateJobsStatus, r as deleteJobs, t as createJob } from "./jobs.functions-By641M3M.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { r as listCvs } from "./cvs.functions-BALbgz3R.mjs";
import { t as Badge } from "./badge-B3f60TId.mjs";
import { a as TableHeader, i as TableHead, n as TableBody, o as TableRow, r as TableCell, t as Table } from "./table-BcaWptOW.mjs";
import { t as ConfirmDialog } from "./ConfirmDialog-fZSWgi3a.mjs";
import { n as CheckboxIndicator, t as Checkbox$1 } from "../_libs/@radix-ui/react-checkbox+[...].mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, o as Textarea, r as SelectItem, t as Select } from "./select-B_ezB_KN.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/jobs-DAwEnyDa.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var Checkbox = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Checkbox$1, {
	ref,
	className: cn("grid place-content-center peer h-4 w-4 shrink-0 rounded-sm border border-primary shadow cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground", className),
	...props,
	children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CheckboxIndicator, {
		className: cn("grid place-content-center text-current"),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-4 w-4" })
	})
}));
Checkbox.displayName = Checkbox$1.displayName;
var STATUSES = [
	"saved",
	"applied",
	"interview",
	"offer",
	"rejected"
];
var statusColor = {
	saved: "bg-muted text-muted-foreground",
	applied: "bg-accent text-accent-foreground",
	interview: "bg-primary/15 text-primary",
	offer: "bg-emerald-100 text-emerald-900",
	rejected: "bg-destructive/15 text-destructive"
};
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
function JobsPage() {
	const qc = useQueryClient();
	const list = useServerFn(listJobs);
	const create = useServerFn(createJob);
	const update = useServerFn(updateJob);
	const remove = useServerFn(deleteJob);
	const removeMany = useServerFn(deleteJobs);
	const updateStatusMany = useServerFn(updateJobsStatus);
	const { data: jobs = [], isLoading } = useQuery({
		queryKey: ["jobs"],
		queryFn: () => list()
	});
	const cvsList = useServerFn(listCvs);
	const { data: cvs = [] } = useQuery({
		queryKey: ["cvs"],
		queryFn: () => cvsList()
	});
	const [open, setOpen] = (0, import_react.useState)(false);
	const [editing, setEditing] = (0, import_react.useState)(null);
	const [viewing, setViewing] = (0, import_react.useState)(null);
	const [statusFilter, setStatusFilter] = (0, import_react.useState)("all");
	const [sortBy, setSortBy] = (0, import_react.useState)("newest");
	const [selected, setSelected] = (0, import_react.useState)(/* @__PURE__ */ new Set());
	const [confirmDeleteId, setConfirmDeleteId] = (0, import_react.useState)(null);
	const [confirmBulkDelete, setConfirmBulkDelete] = (0, import_react.useState)(false);
	const [pendingStatus, setPendingStatus] = (0, import_react.useState)(null);
	const toggleOne = (id) => setSelected((s) => {
		const n = new Set(s);
		if (n.has(id)) n.delete(id);
		else n.add(id);
		return n;
	});
	const clearSelection = () => setSelected(/* @__PURE__ */ new Set());
	const visibleJobs = (() => {
		const arr = [...statusFilter === "all" ? jobs : jobs.filter((j) => j.status === statusFilter)];
		arr.sort((a, b) => {
			switch (sortBy) {
				case "oldest": return +new Date(a.created_at) - +new Date(b.created_at);
				case "deadline": return (a.deadline ? +new Date(a.deadline) : Infinity) - (b.deadline ? +new Date(b.deadline) : Infinity);
				default: return +new Date(b.created_at) - +new Date(a.created_at);
			}
		});
		return arr;
	})();
	const statusCounts = STATUSES.reduce((acc, s) => {
		acc[s] = jobs.filter((j) => j.status === s).length;
		return acc;
	}, {});
	const saveMutation = useMutation({
		mutationFn: async (input) => {
			if (editing) return update({ data: {
				id: editing.id,
				patch: input
			} });
			return create({ data: input });
		},
		onSuccess: () => {
			toast.success(editing ? "Job updated" : "Job saved");
			setOpen(false);
			setEditing(null);
			qc.invalidateQueries({ queryKey: ["jobs"] });
		},
		onError: (e) => toast.error(e instanceof Error ? e.message : "Save failed")
	});
	const deleteMutation = useMutation({
		mutationFn: (id) => remove({ data: { id } }),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["jobs"] });
			toast.success("Job deleted");
			setConfirmDeleteId(null);
		},
		onError: (e) => toast.error(e instanceof Error ? e.message : "Delete failed")
	});
	const bulkDeleteMutation = useMutation({
		mutationFn: (ids) => removeMany({ data: { ids } }),
		onSuccess: (res) => {
			qc.invalidateQueries({ queryKey: ["jobs"] });
			clearSelection();
			setConfirmBulkDelete(false);
			toast.success(`Deleted ${res?.count ?? ""} job${(res?.count ?? 0) === 1 ? "" : "s"}`);
		},
		onError: (e) => toast.error(e instanceof Error ? e.message : "Bulk delete failed")
	});
	const bulkStatusMutation = useMutation({
		mutationFn: ({ ids, status }) => updateStatusMany({ data: {
			ids,
			status
		} }),
		onSuccess: (res) => {
			qc.invalidateQueries({ queryKey: ["jobs"] });
			clearSelection();
			setPendingStatus(null);
			toast.success(`Updated ${res?.count ?? ""} job${(res?.count ?? 0) === 1 ? "" : "s"} to ${res?.status}`);
		},
		onError: (e) => toast.error(e instanceof Error ? e.message : "Bulk update failed")
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-serif text-3xl",
					children: "Tracker"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground",
					children: "Your application pipeline."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Dialog, {
					open,
					onOpenChange: (o) => {
						setOpen(o);
						if (!o) setEditing(null);
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTrigger, {
						asChild: true,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "mr-1 h-4 w-4" }), " Add job"] })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(JobDialog, {
						initial: editing,
						cvs,
						onSubmit: (v) => saveMutation.mutate(v),
						saving: saveMutation.isPending
					}, editing?.id ?? "new")]
				})]
			}),
			isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground",
				children: "Loading…"
			}) : jobs.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
				className: "py-12 text-center text-muted-foreground",
				children: "No jobs yet. Add your first one."
			}) }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap gap-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: () => setStatusFilter("all"),
						className: `rounded-full border px-3 py-1 text-xs transition ${statusFilter === "all" ? "bg-foreground text-background border-foreground" : "hover:bg-accent"}`,
						children: ["All ", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "opacity-60",
							children: [
								"(",
								jobs.length,
								")"
							]
						})]
					}), STATUSES.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: () => setStatusFilter(s),
						className: `rounded-full border px-3 py-1 text-xs capitalize transition ${statusFilter === s ? "bg-foreground text-background border-foreground" : "hover:bg-accent"}`,
						children: [
							s,
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "opacity-60",
								children: [
									"(",
									statusCounts[s] ?? 0,
									")"
								]
							})
						]
					}, s))]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						className: "text-xs text-muted-foreground",
						children: "Sort"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
						value: sortBy,
						onValueChange: (v) => setSortBy(v),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
							className: "h-8 w-[170px]",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: "newest",
								children: "Newest first"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: "oldest",
								children: "Oldest first"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: "deadline",
								children: "Upcoming deadline"
							})
						] })]
					})]
				})]
			}), visibleJobs.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
				className: "py-8 text-center text-sm text-muted-foreground",
				children: "No jobs match this filter."
			}) }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [selected.size > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between gap-3 rounded-md border bg-muted/40 px-3 py-2 text-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [selected.size, " selected"] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							value: "",
							onValueChange: (v) => setPendingStatus(v),
							disabled: bulkStatusMutation.isPending,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
								className: "h-8 w-[170px]",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: bulkStatusMutation.isPending ? "Updating…" : "Change status…" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: STATUSES.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: s,
								className: "capitalize",
								children: s
							}, s)) })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: "ghost",
							onClick: clearSelection,
							children: "Clear"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "sm",
							variant: "destructive",
							disabled: bulkDeleteMutation.isPending,
							onClick: () => setConfirmBulkDelete(true),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "mr-1 h-4 w-4" }), bulkDeleteMutation.isPending ? "Deleting…" : "Delete selected"]
						})
					]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "rounded-lg border bg-card overflow-hidden",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "overflow-x-auto",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, {
						className: "bg-muted/40 hover:bg-muted/40",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
								className: "w-[40px]",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Checkbox, {
									checked: visibleJobs.length > 0 && visibleJobs.every((j) => selected.has(j.id)),
									onCheckedChange: (v) => {
										setSelected((prev) => {
											const n = new Set(prev);
											if (v) visibleJobs.forEach((j) => n.add(j.id));
											else visibleJobs.forEach((j) => n.delete(j.id));
											return n;
										});
									},
									"aria-label": "Select all"
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
								className: "min-w-[200px]",
								children: "Job Position"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
								className: "min-w-[140px]",
								children: "Company"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
								className: "min-w-[120px]",
								children: "Status"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
								className: "min-w-[120px]",
								children: "Date Saved"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
								className: "min-w-[120px]",
								children: "Follow up"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
								className: "min-w-[140px]",
								children: "CV used"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
								className: "min-w-[80px]",
								children: "Listing"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
								className: "w-[90px] text-right",
								children: "Actions"
							})
						]
					}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableBody, { children: visibleJobs.map((j) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, {
						"data-state": selected.has(j.id) ? "selected" : void 0,
						className: "cursor-pointer",
						onClick: () => setViewing(j),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
								onClick: (e) => e.stopPropagation(),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Checkbox, {
									checked: selected.has(j.id),
									onCheckedChange: () => toggleOne(j.id),
									"aria-label": `Select ${j.title}`
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
								className: "font-medium",
								children: j.title
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
								className: "text-muted-foreground",
								children: j.company
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: `inline-block rounded px-2 py-0.5 text-xs font-medium capitalize ${statusColor[j.status]}`,
								children: j.status
							}) }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
								className: "text-sm text-muted-foreground whitespace-nowrap",
								children: formatDate(j.created_at) ?? "—"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
								className: "text-sm text-muted-foreground whitespace-nowrap",
								children: formatDate(j.deadline) ?? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-muted-foreground/60",
									children: "N/A"
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: j.cv_id ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
								variant: "secondary",
								className: "gap-1 max-w-[180px]",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "h-3 w-3 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "truncate",
									children: cvs.find((c) => c.id === j.cv_id)?.label ?? "CV"
								})]
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-muted-foreground/60 text-sm",
								children: "—"
							}) }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
								onClick: (e) => e.stopPropagation(),
								children: j.url ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
									href: j.url,
									target: "_blank",
									rel: "noreferrer",
									className: "inline-flex items-center gap-1 text-sm underline",
									children: ["Open ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { className: "h-3 w-3" })]
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-muted-foreground/60 text-sm",
									children: "—"
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
								className: "text-right",
								onClick: (e) => e.stopPropagation(),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex justify-end gap-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "icon",
										variant: "ghost",
										onClick: () => {
											setEditing(j);
											setOpen(true);
										},
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "h-4 w-4" })
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "icon",
										variant: "ghost",
										onClick: () => setConfirmDeleteId(j.id),
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-4 w-4" })
									})]
								})
							})
						]
					}, j.id)) })] })
				})
			})] })] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConfirmDialog, {
				open: !!confirmDeleteId,
				onOpenChange: (o) => {
					if (!o) setConfirmDeleteId(null);
				},
				title: "Delete this job?",
				description: "This action cannot be undone.",
				confirmLabel: "Delete",
				destructive: true,
				loading: deleteMutation.isPending,
				onConfirm: () => confirmDeleteId && deleteMutation.mutate(confirmDeleteId)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConfirmDialog, {
				open: confirmBulkDelete,
				onOpenChange: setConfirmBulkDelete,
				title: `Delete ${selected.size} job${selected.size === 1 ? "" : "s"}?`,
				description: "This action cannot be undone.",
				confirmLabel: "Delete",
				destructive: true,
				loading: bulkDeleteMutation.isPending,
				onConfirm: () => bulkDeleteMutation.mutate(Array.from(selected))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConfirmDialog, {
				open: !!pendingStatus,
				onOpenChange: (o) => {
					if (!o) setPendingStatus(null);
				},
				title: "Change status?",
				description: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
					"Set status of ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: selected.size }),
					" job",
					selected.size === 1 ? "" : "s",
					" to ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", {
						className: "capitalize",
						children: pendingStatus ?? ""
					}),
					"."
				] }),
				confirmLabel: "Update",
				loading: bulkStatusMutation.isPending,
				onConfirm: () => pendingStatus && bulkStatusMutation.mutate({
					ids: Array.from(selected),
					status: pendingStatus
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: !!viewing,
				onOpenChange: (o) => !o && setViewing(null),
				children: viewing && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "max-w-lg max-h-[90vh] flex flex-col p-0 gap-0",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, {
							className: "px-6 pt-6 pb-3 shrink-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: viewing.title }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-muted-foreground",
								children: viewing.company
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex-1 overflow-y-auto px-6 pb-4 space-y-4 text-sm",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex flex-wrap gap-2",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: `rounded px-2 py-0.5 text-xs font-medium ${statusColor[viewing.status]}`,
											children: viewing.status
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
											variant: "outline",
											className: "gap-1",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "h-3 w-3" }),
												" Saved ",
												formatDate(viewing.created_at)
											]
										}),
										viewing.deadline && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
											variant: "outline",
											className: "gap-1",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalendarDays, { className: "h-3 w-3" }),
												" Follow up ",
												formatDate(viewing.deadline)
											]
										})
									]
								}),
								viewing.url && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									className: "text-xs text-muted-foreground",
									children: "Listing URL"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
									href: viewing.url,
									target: "_blank",
									rel: "noreferrer",
									className: "block underline break-all",
									children: viewing.url
								})] }),
								viewing.cv_id && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									className: "text-xs text-muted-foreground",
									children: "CV used"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-1",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
										variant: "secondary",
										className: "gap-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "h-3 w-3" }), cvs.find((c) => c.id === viewing.cv_id)?.label ?? "—"]
									})
								})] }),
								viewing.job_description && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									className: "text-xs text-muted-foreground",
									children: "Job description"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "whitespace-pre-wrap",
									children: viewing.job_description
								})] }),
								viewing.notes && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									className: "text-xs text-muted-foreground",
									children: "Notes"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "whitespace-pre-wrap",
									children: viewing.notes
								})] })
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, {
							className: "px-6 py-4 border-t shrink-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "outline",
								onClick: () => setViewing(null),
								children: "Close"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								onClick: () => {
									setEditing(viewing);
									setViewing(null);
									setOpen(true);
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "mr-1 h-4 w-4" }), " Edit"]
							})]
						})
					]
				})
			})
		]
	});
}
function JobDialog({ initial, cvs, onSubmit, saving }) {
	const NONE = "__none__";
	const [form, setForm] = (0, import_react.useState)({
		company: initial?.company ?? "",
		title: initial?.title ?? "",
		status: initial?.status ?? "saved",
		notes: initial?.notes ?? "",
		url: initial?.url ?? "",
		job_description: initial?.job_description ?? "",
		deadline: initial?.deadline ?? "",
		cv_id: initial?.cv_id ?? null
	});
	const set = (k, v) => setForm((f) => ({
		...f,
		[k]: v
	}));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
		className: "max-w-lg max-h-[90vh] flex flex-col p-0 gap-0",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, {
			className: "px-6 pt-6 pb-3 shrink-0",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: initial ? "Edit job" : "Add job" })
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			className: "flex flex-col min-h-0 flex-1",
			onSubmit: (e) => {
				e.preventDefault();
				onSubmit({
					...form,
					deadline: form.deadline || null,
					url: form.url || null,
					job_description: form.job_description || null,
					notes: form.notes || null,
					cv_id: form.cv_id || null
				});
			},
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex-1 overflow-y-auto px-6 space-y-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-2 gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Company" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: form.company,
								onChange: (e) => set("company", e.target.value),
								required: true
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Title" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: form.title,
								onChange: (e) => set("title", e.target.value),
								required: true
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-2 gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Status" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
								value: form.status,
								onValueChange: (v) => set("status", v),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: STATUSES.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: s,
									children: s
								}, s)) })]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Follow-up date" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								type: "date",
								value: form.deadline ?? "",
								onChange: (e) => set("deadline", e.target.value)
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Listing URL" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: form.url,
							onChange: (e) => set("url", e.target.value),
							placeholder: "https://…"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "CV used" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							value: form.cv_id ?? NONE,
							onValueChange: (v) => set("cv_id", v === NONE ? null : v),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: cvs.length === 0 ? "No CVs uploaded yet" : "Select a CV" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: NONE,
								children: "None"
							}), cvs.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: c.id,
								children: c.label
							}, c.id))] })]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Job description" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
							rows: 3,
							value: form.job_description,
							onChange: (e) => set("job_description", e.target.value)
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Notes" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
							rows: 2,
							value: form.notes,
							onChange: (e) => set("notes", e.target.value)
						})]
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogFooter, {
				className: "px-6 py-4 border-t shrink-0",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "submit",
					disabled: saving,
					children: saving ? "Saving…" : "Save"
				})
			})]
		})]
	});
}
//#endregion
export { JobsPage as component };
