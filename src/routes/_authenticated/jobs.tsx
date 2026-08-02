import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { listJobs, createJob, updateJob, deleteJob, deleteJobs, updateJobsStatus } from "@/lib/jobs.functions";
import { listCvs } from "@/lib/cvs.functions";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Plus, Trash2, Pencil, CalendarDays, Clock, ExternalLink, FileText } from "lucide-react";

export const Route = createFileRoute("/_authenticated/jobs")({
  head: () => ({
    meta: [
      { title: "Tracker · ApplyPilot" },
      { name: "description", content: "Your saved, applied, and interview-stage job applications in one place." },
      { property: "og:title", content: "Tracker · ApplyPilot" },
      { property: "og:description", content: "Track your job applications." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: JobsPage,
});

type Status = "saved" | "applied" | "interview" | "offer" | "rejected";
const STATUSES: Status[] = ["saved", "applied", "interview", "offer", "rejected"];

const statusColor: Record<Status, string> = {
  saved: "bg-muted text-muted-foreground",
  applied: "bg-accent text-accent-foreground",
  interview: "bg-primary/15 text-primary",
  offer: "bg-emerald-100 text-emerald-900",
  rejected: "bg-destructive/15 text-destructive",
};

function formatDate(d?: string | null) {
  if (!d) return null;
  try {
    return new Date(d).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
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
    queryFn: () => list(),
  });
  const cvsList = useServerFn(listCvs);
  const { data: cvs = [] } = useQuery({ queryKey: ["cvs"], queryFn: () => cvsList() });

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [viewing, setViewing] = useState<any | null>(null);
  const [statusFilter, setStatusFilter] = useState<Status | "all">("all");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "deadline">("newest");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<Status | null>(null);
  const toggleOne = (id: string) => setSelected((s) => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  const clearSelection = () => setSelected(new Set());

  const visibleJobs = (() => {
    const filtered = statusFilter === "all" ? jobs : jobs.filter((j: any) => j.status === statusFilter);
    const arr = [...filtered];
    arr.sort((a: any, b: any) => {
      switch (sortBy) {
        case "oldest": return +new Date(a.created_at) - +new Date(b.created_at);
        case "deadline": {
          const av = a.deadline ? +new Date(a.deadline) : Infinity;
          const bv = b.deadline ? +new Date(b.deadline) : Infinity;
          return av - bv;
        }
        case "newest":
        default: return +new Date(b.created_at) - +new Date(a.created_at);
      }
    });
    return arr;
  })();

  const statusCounts = STATUSES.reduce<Record<string, number>>((acc, s) => {
    acc[s] = jobs.filter((j: any) => j.status === s).length;
    return acc;
  }, {});

  const saveMutation = useMutation({
    mutationFn: async (input: any) => {
      if (editing) return update({ data: { id: editing.id, patch: input } });
      return create({ data: input });
    },
    onSuccess: () => {
      toast.success(editing ? "Job updated" : "Job saved");
      setOpen(false);
      setEditing(null);
      qc.invalidateQueries({ queryKey: ["jobs"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Save failed"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => remove({ data: { id } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["jobs"] });
      toast.success("Job deleted");
      setConfirmDeleteId(null);
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Delete failed"),
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: (ids: string[]) => removeMany({ data: { ids } }),
    onSuccess: (res: any) => {
      qc.invalidateQueries({ queryKey: ["jobs"] });
      clearSelection();
      setConfirmBulkDelete(false);
      toast.success(`Deleted ${res?.count ?? ""} job${(res?.count ?? 0) === 1 ? "" : "s"}`);
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Bulk delete failed"),
  });

  const bulkStatusMutation = useMutation({
    mutationFn: ({ ids, status }: { ids: string[]; status: Status }) =>
      updateStatusMany({ data: { ids, status } }),
    onSuccess: (res: any) => {
      qc.invalidateQueries({ queryKey: ["jobs"] });
      clearSelection();
      setPendingStatus(null);
      toast.success(`Updated ${res?.count ?? ""} job${(res?.count ?? 0) === 1 ? "" : "s"} to ${res?.status}`);
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Bulk update failed"),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl">Tracker</h1>
          <p className="text-sm text-muted-foreground">Your application pipeline.</p>
        </div>
        <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setEditing(null); }}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-1 h-4 w-4" /> Add job</Button>
          </DialogTrigger>
          <JobDialog
            key={editing?.id ?? "new"}
            initial={editing}
            cvs={cvs}
            onSubmit={(v) => saveMutation.mutate(v)}
            saving={saveMutation.isPending}
          />
        </Dialog>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : jobs.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">No jobs yet. Add your first one.</CardContent></Card>
      ) : (
        <>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setStatusFilter("all")}
              className={`rounded-full border px-3 py-1 text-xs transition ${statusFilter === "all" ? "bg-foreground text-background border-foreground" : "hover:bg-accent"}`}
            >
              All <span className="opacity-60">({jobs.length})</span>
            </button>
            {STATUSES.map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`rounded-full border px-3 py-1 text-xs capitalize transition ${statusFilter === s ? "bg-foreground text-background border-foreground" : "hover:bg-accent"}`}
              >
                {s} <span className="opacity-60">({statusCounts[s] ?? 0})</span>
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Label className="text-xs text-muted-foreground">Sort</Label>
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
              <SelectTrigger className="h-8 w-[170px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest first</SelectItem>
                <SelectItem value="oldest">Oldest first</SelectItem>
                <SelectItem value="deadline">Upcoming deadline</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        {visibleJobs.length === 0 ? (
          <Card><CardContent className="py-8 text-center text-sm text-muted-foreground">No jobs match this filter.</CardContent></Card>
        ) : (
        <>
        {selected.size > 0 && (
          <div className="flex items-center justify-between gap-3 rounded-md border bg-muted/40 px-3 py-2 text-sm">
            <span>{selected.size} selected</span>
            <div className="flex flex-wrap items-center gap-2">
              <Select
                value=""
                onValueChange={(v) => setPendingStatus(v as Status)}
                disabled={bulkStatusMutation.isPending}
              >
                <SelectTrigger className="h-8 w-[170px]">
                  <SelectValue placeholder={bulkStatusMutation.isPending ? "Updating…" : "Change status…"} />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => (
                    <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button size="sm" variant="ghost" onClick={clearSelection}>Clear</Button>
              <Button
                size="sm"
                variant="destructive"
                disabled={bulkDeleteMutation.isPending}
                onClick={() => setConfirmBulkDelete(true)}
              >
                <Trash2 className="mr-1 h-4 w-4" />
                {bulkDeleteMutation.isPending ? "Deleting…" : "Delete selected"}
              </Button>
            </div>
          </div>
        )}
        <div className="rounded-lg border bg-card overflow-hidden">
          <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead className="w-[40px]">
                  <Checkbox
                    checked={visibleJobs.length > 0 && visibleJobs.every((j: any) => selected.has(j.id))}
                    onCheckedChange={(v) => {
                      setSelected((prev) => {
                        const n = new Set(prev);
                        if (v) visibleJobs.forEach((j: any) => n.add(j.id));
                        else visibleJobs.forEach((j: any) => n.delete(j.id));
                        return n;
                      });
                    }}
                    aria-label="Select all"
                  />
                </TableHead>
                <TableHead className="min-w-[200px]">Job Position</TableHead>
                <TableHead className="min-w-[140px]">Company</TableHead>
                <TableHead className="min-w-[120px]">Status</TableHead>
                <TableHead className="min-w-[120px]">Date Saved</TableHead>
                <TableHead className="min-w-[120px]">Follow up</TableHead>
                <TableHead className="min-w-[140px]">CV used</TableHead>
                <TableHead className="min-w-[80px]">Listing</TableHead>
                <TableHead className="w-[90px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibleJobs.map((j: any) => (
                <TableRow
                  key={j.id}
                  data-state={selected.has(j.id) ? "selected" : undefined}
                  className="cursor-pointer"
                  onClick={() => setViewing(j)}
                >
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={selected.has(j.id)}
                      onCheckedChange={() => toggleOne(j.id)}
                      aria-label={`Select ${j.title}`}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{j.title}</TableCell>
                  <TableCell className="text-muted-foreground">{j.company}</TableCell>
                  <TableCell>
                    <span className={`inline-block rounded px-2 py-0.5 text-xs font-medium capitalize ${statusColor[j.status as Status]}`}>
                      {j.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                    {formatDate(j.created_at) ?? "—"}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                    {formatDate(j.deadline) ?? <span className="text-muted-foreground/60">N/A</span>}
                  </TableCell>
                  <TableCell>
                    {j.cv_id ? (
                      <Badge variant="secondary" className="gap-1 max-w-[180px]">
                        <FileText className="h-3 w-3 shrink-0" />
                        <span className="truncate">{cvs.find((c: any) => c.id === j.cv_id)?.label ?? "CV"}</span>
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground/60 text-sm">—</span>
                    )}
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    {j.url ? (
                      <a
                        href={j.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-sm underline"
                      >
                        Open <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : (
                      <span className="text-muted-foreground/60 text-sm">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex justify-end gap-1">
                      <Button size="icon" variant="ghost" onClick={() => { setEditing(j); setOpen(true); }}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => setConfirmDeleteId(j.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          </div>
        </div>
        </>
        )}
        </>
      )}

      <ConfirmDialog
        open={!!confirmDeleteId}
        onOpenChange={(o) => { if (!o) setConfirmDeleteId(null); }}
        title="Delete this job?"
        description="This action cannot be undone."
        confirmLabel="Delete"
        destructive
        loading={deleteMutation.isPending}
        onConfirm={() => confirmDeleteId && deleteMutation.mutate(confirmDeleteId)}
      />

      <ConfirmDialog
        open={confirmBulkDelete}
        onOpenChange={setConfirmBulkDelete}
        title={`Delete ${selected.size} job${selected.size === 1 ? "" : "s"}?`}
        description="This action cannot be undone."
        confirmLabel="Delete"
        destructive
        loading={bulkDeleteMutation.isPending}
        onConfirm={() => bulkDeleteMutation.mutate(Array.from(selected))}
      />

      <ConfirmDialog
        open={!!pendingStatus}
        onOpenChange={(o) => { if (!o) setPendingStatus(null); }}
        title="Change status?"
        description={
          <>Set status of <b>{selected.size}</b> job{selected.size === 1 ? "" : "s"} to <b className="capitalize">{pendingStatus ?? ""}</b>.</>
        }
        confirmLabel="Update"
        loading={bulkStatusMutation.isPending}
        onConfirm={() => pendingStatus && bulkStatusMutation.mutate({ ids: Array.from(selected), status: pendingStatus })}
      />


      <Dialog open={!!viewing} onOpenChange={(o) => !o && setViewing(null)}>
        {viewing && (
          <DialogContent className="max-w-lg max-h-[90vh] flex flex-col p-0 gap-0">
            <DialogHeader className="px-6 pt-6 pb-3 shrink-0">
              <DialogTitle>{viewing.title}</DialogTitle>
              <p className="text-sm text-muted-foreground">{viewing.company}</p>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto px-6 pb-4 space-y-4 text-sm">
              <div className="flex flex-wrap gap-2">
                <span className={`rounded px-2 py-0.5 text-xs font-medium ${statusColor[viewing.status as Status]}`}>
                  {viewing.status}
                </span>
                <Badge variant="outline" className="gap-1">
                  <Clock className="h-3 w-3" /> Saved {formatDate(viewing.created_at)}
                </Badge>
                {viewing.deadline && (
                  <Badge variant="outline" className="gap-1">
                    <CalendarDays className="h-3 w-3" /> Follow up {formatDate(viewing.deadline)}
                  </Badge>
                )}
              </div>
              {viewing.url && (
                <div>
                  <Label className="text-xs text-muted-foreground">Listing URL</Label>
                  <a href={viewing.url} target="_blank" rel="noreferrer" className="block underline break-all">
                    {viewing.url}
                  </a>
                </div>
              )}
              {viewing.cv_id && (
                <div>
                  <Label className="text-xs text-muted-foreground">CV used</Label>
                  <div className="mt-1">
                    <Badge variant="secondary" className="gap-1">
                      <FileText className="h-3 w-3" />
                      {cvs.find((c: any) => c.id === viewing.cv_id)?.label ?? "—"}
                    </Badge>
                  </div>
                </div>
              )}
              {viewing.job_description && (
                <div>
                  <Label className="text-xs text-muted-foreground">Job description</Label>
                  <p className="whitespace-pre-wrap">{viewing.job_description}</p>
                </div>
              )}
              {viewing.notes && (
                <div>
                  <Label className="text-xs text-muted-foreground">Notes</Label>
                  <p className="whitespace-pre-wrap">{viewing.notes}</p>
                </div>
              )}
            </div>
            <DialogFooter className="px-6 py-4 border-t shrink-0">
              <Button variant="outline" onClick={() => setViewing(null)}>Close</Button>
              <Button onClick={() => { setEditing(viewing); setViewing(null); setOpen(true); }}>
                <Pencil className="mr-1 h-4 w-4" /> Edit
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}

function JobDialog({ initial, cvs, onSubmit, saving }: { initial: any | null; cvs: any[]; onSubmit: (v: any) => void; saving: boolean }) {
  const NONE = "__none__";
  const [form, setForm] = useState({
    company: initial?.company ?? "",
    title: initial?.title ?? "",
    status: (initial?.status ?? "saved") as Status,
    notes: initial?.notes ?? "",
    url: initial?.url ?? "",
    job_description: initial?.job_description ?? "",
    deadline: initial?.deadline ?? "",
    cv_id: initial?.cv_id ?? null,
  });
  const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));
  return (
    <DialogContent className="max-w-lg max-h-[90vh] flex flex-col p-0 gap-0">
      <DialogHeader className="px-6 pt-6 pb-3 shrink-0"><DialogTitle>{initial ? "Edit job" : "Add job"}</DialogTitle></DialogHeader>
      <form
        className="flex flex-col min-h-0 flex-1"
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit({
            ...form,
            deadline: form.deadline || null,
            url: form.url || null,
            job_description: form.job_description || null,
            notes: form.notes || null,
            cv_id: form.cv_id || null,
          });
        }}
      >
        <div className="flex-1 overflow-y-auto px-6 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Company</Label>
            <Input value={form.company} onChange={(e) => set("company", e.target.value)} required />
          </div>
          <div className="space-y-1.5">
            <Label>Title</Label>
            <Input value={form.title} onChange={(e) => set("title", e.target.value)} required />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Status</Label>
            <Select value={form.status} onValueChange={(v) => set("status", v as Status)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Follow-up date</Label>
            <Input type="date" value={form.deadline ?? ""} onChange={(e) => set("deadline", e.target.value)} />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>Listing URL</Label>
          <Input value={form.url} onChange={(e) => set("url", e.target.value)} placeholder="https://…" />
        </div>
        <div className="space-y-1.5">
          <Label>CV used</Label>
          <Select
            value={form.cv_id ?? NONE}
            onValueChange={(v) => set("cv_id", v === NONE ? null : v)}
          >
            <SelectTrigger>
              <SelectValue placeholder={cvs.length === 0 ? "No CVs uploaded yet" : "Select a CV"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={NONE}>None</SelectItem>
              {cvs.map((c: any) => (
                <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Job description</Label>
          <Textarea rows={3} value={form.job_description} onChange={(e) => set("job_description", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>Notes</Label>
          <Textarea rows={2} value={form.notes} onChange={(e) => set("notes", e.target.value)} />
        </div>
        </div>
        <DialogFooter className="px-6 py-4 border-t shrink-0">
          <Button type="submit" disabled={saving}>{saving ? "Saving…" : "Save"}</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
