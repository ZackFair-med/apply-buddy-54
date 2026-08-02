import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useState } from "react";
import { listJobs } from "@/lib/jobs.functions";
import { getProfile, updateProfile } from "@/lib/profile.functions";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Pencil, Plus, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/_authenticated/")({
  head: () => ({
    meta: [
      { title: "Dashboard · ApplyPilot" },
      { name: "description", content: "Your career goal, weekly applications progress, and pipeline breakdown." },
      { property: "og:title", content: "Dashboard · ApplyPilot" },
      { property: "og:description", content: "Track your career goal and application pipeline." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: DashboardPage,
});

type Status = "saved" | "applied" | "interview" | "offer" | "rejected";

function formatMonthYear(iso: string | null | undefined) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, { month: "long", year: "numeric" });
}

function formatSalary(min: number | null, max: number | null, currency: string | null) {
  if (!min && !max) return "—";
  const cur = currency || "USD";
  const fmt = (n: number) =>
    new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: cur,
      maximumFractionDigits: 0,
    }).format(n);
  if (min && max) return `${fmt(min)} — ${fmt(max)}`;
  return fmt((min ?? max)!);
}

function DashboardPage() {
  const qc = useQueryClient();
  const listFn = useServerFn(listJobs);
  const getProfileFn = useServerFn(getProfile);
  const updateProfileFn = useServerFn(updateProfile);

  const { data: jobs = [] } = useQuery({ queryKey: ["jobs"], queryFn: () => listFn() });
  const { data: profile } = useQuery({ queryKey: ["profile"], queryFn: () => getProfileFn() });

  const counts = useMemo(() => {
    const base: Record<Status, number> = { saved: 0, applied: 0, interview: 0, offer: 0, rejected: 0 };
    for (const j of jobs as { status: Status }[]) base[j.status] = (base[j.status] ?? 0) + 1;
    return base;
  }, [jobs]);

  const weeklyGoal = profile?.weekly_goal ?? 5;
  const appliedThisWeek = useMemo(() => {
    const start = new Date();
    start.setDate(start.getDate() - 7);
    return (jobs as { status: Status; created_at: string }[]).filter(
      (j) => j.status === "applied" && new Date(j.created_at) >= start,
    ).length;
  }, [jobs]);

  const pct = Math.min(1, weeklyGoal > 0 ? appliedThisWeek / weeklyGoal : 0);
  const ringPct = Math.round(pct * 100);

  const pipeline: { label: string; count: number; color: string }[] = [
    { label: "Bookmarked / Saved", count: counts.saved, color: "var(--muted-foreground)" },
    { label: "Applied", count: counts.applied, color: "var(--primary)" },
    { label: "Interviewing", count: counts.interview, color: "oklch(0.6 0.11 160)" },
    { label: "Negotiating / Offer", count: counts.offer, color: "oklch(0.7 0.14 60)" },
  ];
  const maxPipeline = Math.max(1, ...pipeline.map((p) => p.count));

  const [goalOpen, setGoalOpen] = useState(false);

  return (
    <div className="mx-auto grid max-w-5xl grid-cols-1 gap-5 md:grid-cols-2">
      {/* Next Career Goal */}
      <Card className="border-border shadow-sm md:col-span-2">
        <CardContent className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-serif text-xl text-primary">Next Career Goal</h2>
            <Dialog open={goalOpen} onOpenChange={setGoalOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-primary/70 hover:text-primary">
                  <Pencil className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <GoalDialog
                profile={profile}
                onSaved={() => {
                  setGoalOpen(false);
                  qc.invalidateQueries({ queryKey: ["profile"] });
                }}
                fn={updateProfileFn}
              />
            </Dialog>
          </div>
          <div className="grid grid-cols-2 gap-y-4">
            <GoalField label="Target Title" value={profile?.target_title || "—"} accent />
            <GoalField label="Target Date" value={formatMonthYear(profile?.target_date)} />
            <div className="col-span-2">
              <GoalField
                label="Target Salary Range"
                value={formatSalary(
                  profile?.target_salary_min ?? null,
                  profile?.target_salary_max ?? null,
                  profile?.target_salary_currency ?? "USD",
                )}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Job Applications Donut */}
      <Card className="border-border shadow-sm">
        <CardContent className="flex flex-col items-center p-6 text-center">
          <h2 className="mb-6 w-full text-left font-serif text-lg text-primary">Job Applications</h2>
          <div
            className="relative flex h-36 w-36 items-center justify-center rounded-full"
            style={{
              background: `conic-gradient(var(--primary) 0% ${ringPct}%, var(--muted) ${ringPct}% 100%)`,
            }}
          >
            <div className="flex h-28 w-28 flex-col items-center justify-center rounded-full bg-card">
              <span className="text-3xl font-bold text-primary">{appliedThisWeek}</span>
              <span className="mt-0.5 text-[10px] font-medium leading-tight text-muted-foreground">
                APPLICATIONS
                <br />
                SENT
              </span>
            </div>
          </div>
          <div className="mt-6 w-full">
            <div className="inline-block rounded-full bg-primary px-4 py-1 text-xs font-semibold text-primary-foreground">
              Goal: {weeklyGoal} / week
            </div>
            <p className="mt-4 text-[11px] italic leading-relaxed text-muted-foreground">
              Move jobs to "Applied" in your tracker to update your weekly goal progress.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Pipeline */}
      <Card className="border-border shadow-sm">
        <CardContent className="p-6">
          <h2 className="mb-1 font-serif text-lg text-primary">Job Search Pipeline</h2>
          <p className="mb-6 text-[10px] text-muted-foreground">All-time activity</p>
          <div className="space-y-5">
            {pipeline.map((p) => (
              <div key={p.label} className="space-y-1">
                <div className="flex justify-between text-[11px] font-medium text-foreground/80">
                  <span>{p.label}</span>
                  <span className="font-bold">{p.count}</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${(p.count / maxPipeline) * 100}%`,
                      background: p.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 flex items-center justify-between">
            <Button asChild variant="ghost" size="sm" className="text-primary">
              <Link to="/jobs">
                View all jobs <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Link>
            </Button>
            <Button asChild size="sm">
              <Link to="/jobs">
                <Plus className="mr-1 h-3.5 w-3.5" /> Add job
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function GoalField({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div>
      <p className="mb-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className={`text-sm font-semibold ${accent ? "text-primary" : "text-foreground/90"}`}>
        {value}
      </p>
    </div>
  );
}

function GoalDialog({
  profile,
  onSaved,
  fn,
}: {
  profile: any;
  onSaved: () => void;
  fn: ReturnType<typeof useServerFn<typeof updateProfile>>;
}) {
  const [form, setForm] = useState({
    target_title: "",
    target_date: "",
    target_salary_min: "",
    target_salary_max: "",
    target_salary_currency: "USD",
    weekly_goal: "5",
  });

  useEffect(() => {
    if (profile) {
      setForm({
        target_title: profile.target_title ?? "",
        target_date: profile.target_date ?? "",
        target_salary_min: profile.target_salary_min?.toString() ?? "",
        target_salary_max: profile.target_salary_max?.toString() ?? "",
        target_salary_currency: profile.target_salary_currency ?? "USD",
        weekly_goal: (profile.weekly_goal ?? 5).toString(),
      });
    }
  }, [profile]);

  const save = useMutation({
    mutationFn: () =>
      fn({
        data: {
          target_title: form.target_title.trim() || null,
          target_date: form.target_date || null,
          target_salary_min: form.target_salary_min ? Number(form.target_salary_min) : null,
          target_salary_max: form.target_salary_max ? Number(form.target_salary_max) : null,
          target_salary_currency: form.target_salary_currency || "USD",
          weekly_goal: form.weekly_goal ? Number(form.weekly_goal) : 5,
        },
      }),
    onSuccess: () => {
      toast.success("Goal updated");
      onSaved();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Edit career goal</DialogTitle>
      </DialogHeader>
      <div className="space-y-3">
        <div className="space-y-1.5">
          <Label>Target title</Label>
          <Input
            value={form.target_title}
            onChange={(e) => setForm((f) => ({ ...f, target_title: e.target.value }))}
            placeholder="e.g. Product Strategist"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Target date</Label>
            <Input
              type="date"
              value={form.target_date}
              onChange={(e) => setForm((f) => ({ ...f, target_date: e.target.value }))}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Weekly apply goal</Label>
            <Input
              type="number"
              min={1}
              max={100}
              value={form.weekly_goal}
              onChange={(e) => setForm((f) => ({ ...f, weekly_goal: e.target.value }))}
            />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <Label>Currency</Label>
            <Input
              value={form.target_salary_currency}
              onChange={(e) =>
                setForm((f) => ({ ...f, target_salary_currency: e.target.value.toUpperCase() }))
              }
              maxLength={4}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Salary min</Label>
            <Input
              type="number"
              min={0}
              value={form.target_salary_min}
              onChange={(e) => setForm((f) => ({ ...f, target_salary_min: e.target.value }))}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Salary max</Label>
            <Input
              type="number"
              min={0}
              value={form.target_salary_max}
              onChange={(e) => setForm((f) => ({ ...f, target_salary_max: e.target.value }))}
            />
          </div>
        </div>
      </div>
      <DialogFooter>
        <Button onClick={() => save.mutate()} disabled={save.isPending}>
          {save.isPending ? "Saving…" : "Save goal"}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
