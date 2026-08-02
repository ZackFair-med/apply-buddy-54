import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { listCvs, uploadCv, deleteCv, downloadCv, updateCv } from "@/lib/cvs.functions";
import { getUsageSummary } from "@/lib/usage.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { UpgradePrompt } from "@/components/UpgradePrompt";
import { UsageIndicator } from "@/components/UsageIndicator";
import { Trash2, Upload, FileText, Download, Pencil } from "lucide-react";


export const Route = createFileRoute("/_authenticated/cvs")({
  head: () => ({
    meta: [
      { title: "CVs · ApplyPilot" },
      { name: "description", content: "Upload and tag multiple CV versions. Text is extracted once and reused across AI tailoring." },
      { property: "og:title", content: "CVs · ApplyPilot" },
      { property: "og:description", content: "Manage your CV versions." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CvsPage,
});

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => {
      const s = r.result as string;
      resolve(s.split(",")[1] ?? "");
    };
    r.onerror = () => reject(r.error);
    r.readAsDataURL(file);
  });
}

function formatDate(d?: string | null) {
  if (!d) return null;
  try {
    return new Date(d).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
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

  const { data: cvs = [], isLoading } = useQuery({ queryKey: ["cvs"], queryFn: () => list() });
  const { data: usage, refetch: refetchUsage } = useQuery({
    queryKey: ["usage-summary"],
    queryFn: () => usageFn(),
  });

  const [label, setLabel] = useState("");
  const [tags, setTags] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [editing, setEditing] = useState<{ id: string; label: string; tags: string } | null>(null);
  const [showUpgrade, setShowUpgrade] = useState(false);

  const uploadMut = useMutation({
    mutationFn: async () => {
      if (!file) throw new Error("Pick a file");
      const base64 = await fileToBase64(file);
      return upload({
        data: {
          label,
          tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
          fileName: file.name,
          mimeType: file.type || (file.name.endsWith(".pdf") ? "application/pdf" : "application/vnd.openxmlformats-officedocument.wordprocessingml.document"),
          base64,
        },
      });
    },
    onSuccess: (row: any) => {
      if (row?.limitReached) {
        setShowUpgrade(true);
        return;
      }
      setShowUpgrade(false);
      toast.success(row.parse_error ? `Uploaded (parse failed: ${row.parse_error})` : "Uploaded and parsed");
      setLabel(""); setTags(""); setFile(null);
      qc.invalidateQueries({ queryKey: ["cvs"] });
      refetchUsage();
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Upload failed"),
  });



  const deleteMut = useMutation({
    mutationFn: (id: string) => remove({ data: { id } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cvs"] });
      refetchUsage();
      toast.success("CV deleted");
      setConfirmDeleteId(null);
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Delete failed"),
  });


  const updateMut = useMutation({
    mutationFn: (payload: { id: string; label: string; tags: string[] }) =>
      update({ data: payload }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cvs"] });
      toast.success("CV updated");
      setEditing(null);
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Update failed"),
  });

  const handleDownload = async (id: string) => {
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl">CVs</h1>
        <p className="text-sm text-muted-foreground">Upload PDF or DOCX. Text is extracted once and reused by the tailor.</p>
      </div>

      <Card>
        <CardContent className="space-y-3 py-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Label</Label>
              <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="e.g. Product Manager v3" />
            </div>
            <div className="space-y-1.5">
              <Label>Tags (comma-separated)</Label>
              <Input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="pm, product, startup" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>File</Label>
            <Input type="file" accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={() => uploadMut.mutate()} disabled={!file || !label || uploadMut.isPending}>
              <Upload className="mr-1 h-4 w-4" /> {uploadMut.isPending ? "Uploading…" : "Upload"}
            </Button>
            {usage && (
              <UsageIndicator used={usage.cvProfiles.used} limit={usage.cvProfiles.limit} unit="CV slots" />
            )}
          </div>
        </CardContent>
      </Card>

      {showUpgrade && (
        <UpgradePrompt
          feature="cv_profiles"
          onDismiss={() => setShowUpgrade(false)}
          onUpgrade={() => toast.info("Upgrade flow coming soon")}
        />
      )}


      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : cvs.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">No CVs yet.</CardContent></Card>
      ) : (
        <div className="rounded-lg border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead className="min-w-[200px]">Label</TableHead>
                  <TableHead className="min-w-[160px]">File</TableHead>
                  <TableHead className="min-w-[160px]">Tags</TableHead>
                  <TableHead className="min-w-[120px]">Date uploaded</TableHead>
                  <TableHead className="w-[120px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cvs.map((c: any) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                        {c.label}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground truncate max-w-[200px]">{c.file_name}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {c.tags?.map((t: string) => <Badge key={t} variant="secondary">{t}</Badge>)}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                      {formatDate(c.created_at) ?? "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          title="Edit"
                          onClick={() => setEditing({ id: c.id, label: c.label, tags: (c.tags ?? []).join(", ") })}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          title="Download"
                          disabled={downloadingId === c.id}
                          onClick={() => handleDownload(c.id)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" title="Delete" onClick={() => setConfirmDeleteId(c.id)}>
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
      )}

      <ConfirmDialog
        open={!!confirmDeleteId}
        onOpenChange={(o) => { if (!o) setConfirmDeleteId(null); }}
        title="Delete this CV?"
        description="The file and its parsed text will be permanently removed."
        confirmLabel="Delete"
        destructive
        loading={deleteMut.isPending}
        onConfirm={() => confirmDeleteId && deleteMut.mutate(confirmDeleteId)}
      />

      <Dialog open={!!editing} onOpenChange={(o) => { if (!o) setEditing(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit CV</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label>Label</Label>
                <Input
                  value={editing.label}
                  onChange={(e) => setEditing({ ...editing, label: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Tags (comma-separated)</Label>
                <Input
                  value={editing.tags}
                  onChange={(e) => setEditing({ ...editing, tags: e.target.value })}
                  placeholder="pm, product, startup"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
            <Button
              disabled={!editing?.label.trim() || updateMut.isPending}
              onClick={() => editing && updateMut.mutate({
                id: editing.id,
                label: editing.label.trim(),
                tags: editing.tags.split(",").map((t) => t.trim()).filter(Boolean),
              })}
            >
              {updateMut.isPending ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

