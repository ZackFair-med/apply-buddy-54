import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState, useRef } from "react";
import { listCvs } from "@/lib/cvs.functions";
import {
  analyzeMatch,
  extractKeywords,
  generateCoverLetter,
} from "@/lib/tailor.functions";
import { getUsageSummary } from "@/lib/usage.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  Gauge,
  Tags,
  FileText,
  Loader2,
  Copy,
  Download,
  Sparkles,
  Check,
  AlertCircle,
} from "lucide-react";
import type {
  MatchAnalysis,
  KeywordAnalysis,
  CoverLetterTone,
  MatchGap,
} from "@/lib/ai/types";
import { UpgradePrompt, type UpgradeFeature } from "@/components/UpgradePrompt";


import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import jsPDF from "jspdf";
import { Document, Packer, Paragraph, TextRun } from "docx";

export const Route = createFileRoute("/_authenticated/tailor")({
  head: () => ({
    meta: [
      { title: "AI Assistant · ApplyPilot" },
      {
        name: "description",
        content:
          "Paste a job description and get an AI match score, keyword analysis, and a tailored cover letter — each on demand.",
      },
      { property: "og:title", content: "AI Assistant · ApplyPilot" },
      {
        property: "og:description",
        content: "AI-tailored cover letters and match analysis.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: TailorPage,
});

type Step = "fit" | "cv" | "letter";
type ContextSnapshot = {
  cvId: string;
  jd: string;
  title: string;
  company: string;
};

function TailorPage() {
  const list = useServerFn(listCvs);
  const analyzeFn = useServerFn(analyzeMatch);
  const keywordsFn = useServerFn(extractKeywords);
  const letterFn = useServerFn(generateCoverLetter);
  const usageFn = useServerFn(getUsageSummary);

  const { data: cvs = [] } = useQuery({
    queryKey: ["cvs"],
    queryFn: () => list(),
  });
  const { data: usage, refetch: refetchUsage } = useQuery({
    queryKey: ["usage-summary"],
    queryFn: () => usageFn(),
  });

  const [cvId, setCvId] = useState<string>("");
  const [jd, setJd] = useState("");
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");

  const [activeStep, setActiveStep] = useState<Step>("fit");
  const [analysis, setAnalysis] = useState<MatchAnalysis | null>(null);
  const [keywords, setKeywords] = useState<KeywordAnalysis | null>(null);
  const [letter, setLetter] = useState<string | null>(null);
  const [upgrade, setUpgrade] = useState<UpgradeFeature | null>(null);

  const [contextSnapshots, setContextSnapshots] = useState<
    Partial<Record<Step, ContextSnapshot>>
  >({});

  const workspaceRef = useRef<HTMLDivElement>(null);

  const payload = () => ({
    cvId,
    jobDescription: jd,
    jobTitle: title || undefined,
    company: company || undefined,
  });

  const scrollWorkspace = () => {
    setTimeout(() => {
      workspaceRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const handleResult = <T,>(
    feature: UpgradeFeature,
    targetStep: Step,
    onSuccess: (r: T) => void,
    errLabel: string,
  ) => ({
    onSuccess: (r: any) => {
      if (r?.limitReached) {
        setUpgrade(feature);
        return;
      }
      setUpgrade((prev) => (prev === feature ? null : prev));
      onSuccess(r as T);
      setContextSnapshots((current) => ({
        ...current,
        [targetStep]: { cvId, jd, title, company },
      }));
      setActiveStep(targetStep);
      scrollWorkspace();
      refetchUsage();
    },
    onError: (e: unknown) =>
      toast.error(e instanceof Error ? e.message : errLabel),
  });

  const runAnalyze = useMutation({
    mutationFn: () => analyzeFn({ data: payload() }),
    ...handleResult<MatchAnalysis>(
      "match_score",
      "fit",
      (r) => setAnalysis(r),
      "Analysis failed",
    ),
  });
  const runKeywords = useMutation({
    mutationFn: () => keywordsFn({ data: payload() }),
    ...handleResult<KeywordAnalysis>(
      "keywords",
      "cv",
      (r) => setKeywords(r),
      "Keyword extraction failed",
    ),
  });
  const runLetter = useMutation({
    mutationFn: (tone?: CoverLetterTone) =>
      letterFn({ data: { ...payload(), tone } }),
    ...handleResult<{ coverLetter: string }>(
      "cover_letter",
      "letter",
      (r) => setLetter(r.coverLetter),
      "Cover letter failed",
    ),
  });

  const disabled = !cvId || jd.length < 30;

  const activeSnapshot = contextSnapshots[activeStep];
  const isStale = Boolean(
    activeSnapshot &&
      (activeSnapshot.cvId !== cvId ||
        activeSnapshot.jd !== jd ||
        activeSnapshot.title !== title ||
        activeSnapshot.company !== company),
  );

  const steps: {
    key: Step;
    label: string;
    shortLabel: string;
    icon: typeof Gauge;
    isDone: boolean;
    isLoading: boolean;
    usageInfo?: { used: number; limit: number | null };
  }[] = [
    {
      key: "fit",
      label: "Analyze Fit",
      shortLabel: "Analyze Fit",
      icon: Gauge,
      isDone: Boolean(analysis),
      isLoading: runAnalyze.isPending,
      usageInfo: usage?.matchScore,
    },
    {
      key: "cv",
      label: "Improve CV",
      shortLabel: "Improve CV",
      icon: Tags,
      isDone: Boolean(keywords),
      isLoading: runKeywords.isPending,
      usageInfo: usage?.keywords,
    },
    {
      key: "letter",
      label: "Cover Letter",
      shortLabel: "Cover Letter",
      icon: FileText,
      isDone: Boolean(letter),
      isLoading: runLetter.isPending,
      usageInfo: usage?.coverLetter,
    },
  ];

  // Per-step quota exhausted flags — used to disable CTAs and style usage line
  const fitExhausted =
    Boolean(usage?.matchScore.limit) &&
    usage!.matchScore.used >= usage!.matchScore.limit!;
  const cvExhausted =
    Boolean(usage?.keywords.limit) &&
    usage!.keywords.used >= usage!.keywords.limit!;
  const letterExhausted =
    Boolean(usage?.coverLetter.limit) &&
    usage!.coverLetter.used >= usage!.coverLetter.limit!;

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="space-y-1">
        <h1 className="font-serif text-3xl leading-tight text-foreground">
          AI Assistant
        </h1>
        <p className="text-sm text-muted-foreground">
          Analyze fit, improve your CV, and draft a cover letter — step by step.
        </p>
      </div>

      {/* Application input workspace */}
      <div className="rounded-lg border border-border bg-card p-5 space-y-4">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              CV
            </Label>
            <Select value={cvId} onValueChange={setCvId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a CV" />
              </SelectTrigger>
              <SelectContent>
                {cvs.map((c: { id: string; label: string }) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Job title{" "}
              <span className="normal-case font-normal tracking-normal text-muted-foreground/60">
                (optional)
              </span>
            </Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Senior Product Manager"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Company{" "}
              <span className="normal-case font-normal tracking-normal text-muted-foreground/60">
                (optional)
              </span>
            </Label>
            <Input
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="e.g. Acme Corp"
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Job description
          </Label>
          <Textarea
            rows={6}
            value={jd}
            onChange={(e) => setJd(e.target.value)}
            placeholder="Paste the full job posting here…"
            className="resize-none"
          />
        </div>
      </div>

      {upgrade && (
        <UpgradePrompt
          feature={upgrade}
          onDismiss={() => setUpgrade(null)}
          onUpgrade={() => toast.info("Upgrade flow coming soon")}
        />
      )}

      {/* Workflow stepper — segmented tab bar */}
      <div className="space-y-2">
        <div
          className="flex rounded-lg border border-border bg-muted/40 p-1 gap-1"
          role="tablist"
          aria-label="AI workflow steps"
        >
          {steps.map((step, idx) => {
            const Icon = step.icon;
            const isActive = activeStep === step.key;
            return (
              <button
                key={step.key}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveStep(step.key)}
                className={[
                  "relative flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  isActive
                    ? "bg-white text-primary shadow-sm border border-border/60"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/50",
                ].join(" ")}
              >
                <span className="hidden sm:flex items-center gap-1.5 min-w-0">
                  {step.isLoading ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin shrink-0" />
                  ) : step.isDone ? (
                    <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                  ) : (
                    <span className="text-xs font-bold text-muted-foreground/60 shrink-0 w-3.5 text-center">
                      {idx + 1}
                    </span>
                  )}
                  <span className="truncate">{step.label}</span>
                </span>
                {/* Mobile: icon only */}
                <span className="flex sm:hidden items-center gap-1">
                  {step.isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : step.isDone ? (
                    <Check className="h-4 w-4 text-primary" />
                  ) : (
                    <Icon className="h-4 w-4" />
                  )}
                </span>
              </button>
            );
          })}
        </div>

        {/* Usage line — active step only, finite quota only */}
        {(() => {
          const step = steps.find((s) => s.key === activeStep);
          const info = step?.usageInfo;
          if (!info || info.limit === null) return null;

          const left = Math.max(0, info.limit - info.used);
          const isWeekly = activeStep === "letter" && usage?.coverLetter.window === "week";

          if (left === 0) {
            return (
              <p className="px-0.5 text-xs font-medium text-amber-700">
                {isWeekly ? "Weekly limit reached" : "Daily limit reached · Resets tomorrow"}
              </p>
            );
          }

          const period = isWeekly ? "this week" : "today";
          return (
            <p className="px-0.5 text-xs text-muted-foreground">
              {left} of {info.limit} remaining {period}
            </p>
          );
        })()}
      </div>

      {/* Persistent results workspace */}
      <div ref={workspaceRef} className="scroll-mt-4 space-y-5">
        {isStale && (analysis || keywords || letter) && (
          <div className="flex items-center gap-2.5 rounded-md border border-amber-400/30 bg-amber-50 px-3.5 py-2.5 text-xs text-amber-800">
            <AlertCircle className="h-3.5 w-3.5 shrink-0 text-amber-600" />
            <span>
              Application details changed. Re-run the step below to refresh
              results.
            </span>
          </div>
        )}

        {/* Analyze Fit */}
        {activeStep === "fit" &&
          (runAnalyze.isPending ? (
            <WorkspaceLoading message="Evaluating job match & candidate fit…" />
          ) : analysis ? (
            <AnalysisView
              analysis={analysis}
              isPaid={usage?.plan === "paid"}
              onRegenerate={() => runAnalyze.mutate()}
              regenerateDisabled={disabled || fitExhausted}
            />
          ) : (
            <WorkspaceEmpty
              icon={<Gauge className="h-5 w-5 text-primary" />}
              title="Analyze Fit"
              description="See your match score, strengths, and qualification gaps for this role."
              cta={
                <Button
                  onClick={() => runAnalyze.mutate()}
                  disabled={disabled || runAnalyze.isPending || fitExhausted}
                  size="sm"
                >
                  {runAnalyze.isPending ? (
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Gauge className="mr-1.5 h-3.5 w-3.5" />
                  )}
                  Run Analysis
                </Button>
              }
            />
          ))}

        {/* Improve CV */}
        {activeStep === "cv" &&
          (runKeywords.isPending ? (
            <WorkspaceLoading message="Extracting keywords & generating CV bullet rewrites…" />
          ) : keywords ? (
            <KeywordsView
              keywords={keywords}
              onRegenerate={() => runKeywords.mutate()}
              regenerateDisabled={disabled || cvExhausted}
            />
          ) : (
            <WorkspaceEmpty
              icon={<Tags className="h-5 w-5 text-primary" />}
              title="Improve CV"
              description="Get tailored keyword suggestions and CV bullet rewrites for this role."
              cta={
                <Button
                  onClick={() => runKeywords.mutate()}
                  disabled={disabled || runKeywords.isPending || cvExhausted}
                  size="sm"
                >
                  {runKeywords.isPending ? (
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Tags className="mr-1.5 h-3.5 w-3.5" />
                  )}
                  Improve CV
                </Button>
              }
            />
          ))}

        {/* Cover Letter */}
        {activeStep === "letter" &&
          (runLetter.isPending ? (
            <WorkspaceLoading message="Writing tailored cover letter…" />
          ) : letter ? (
            <LetterView
              letter={letter}
              onRegenerate={(tone) => runLetter.mutate(tone)}
              isRegenerating={runLetter.isPending}
              regenerateDisabled={disabled || letterExhausted}
              company={company}
            />
          ) : (
            <WorkspaceEmpty
              icon={<FileText className="h-5 w-5 text-primary" />}
              title="Cover Letter"
              description="Generate a tailored cover letter based on your CV and this job description."
              cta={
                <Button
                  onClick={() => runLetter.mutate(undefined)}
                  disabled={disabled || runLetter.isPending || letterExhausted}
                  size="sm"
                >
                  {runLetter.isPending ? (
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <FileText className="mr-1.5 h-3.5 w-3.5" />
                  )}
                  Write Cover Letter
                </Button>
              }
            />
          ))}
      </div>
    </div>
  );
}

/* ─── Shared workspace primitives ─────────────────────────────────────────── */

function WorkspaceLoading({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-border bg-card py-12 text-center">
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

function WorkspaceEmpty({
  icon,
  title,
  description,
  cta,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  cta: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border bg-card px-6 py-10 text-center">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/8 text-primary">
        {icon}
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="max-w-xs text-xs text-muted-foreground">{description}</p>
      </div>
      <div className="pt-1">{cta}</div>
    </div>
  );
}

/* ─── Verdict helper ─────────────────────────────────────────────────────── */

function getVerdict(score: number, gaps: MatchGap[]) {
  const criticalCount = gaps.filter((g) => g.severity === "critical").length;

  if (criticalCount > 0) {
    if (score >= 75) {
      return {
        title: "Good Alignment — Critical Gap",
        variant: "destructive" as const,
        description: "Strong overall match, but a mandatory requirement is missing.",
      };
    }
    return {
      title: "Significant Gaps",
      variant: "destructive" as const,
      description: "Must-have qualifications or mandatory requirements are missing.",
    };
  }

  if (score >= 80) {
    return {
      title: "Strong Fit",
      variant: "default" as const,
      description: "Excellent alignment with role requirements.",
    };
  }
  if (score >= 65) {
    return {
      title: "Good Fit — Minor Improvements",
      variant: "secondary" as const,
      description: "Solid background with minor adjustments needed.",
    };
  }
  if (score >= 50) {
    return {
      title: "Moderate Fit — Address Key Gaps",
      variant: "outline" as const,
      description: "Meets basic prerequisites but has notable gaps.",
    };
  }
  return {
    title: "Significant Gaps",
    variant: "destructive" as const,
    description: "Multiple key qualifications are missing for this position.",
  };
}

/* ─── Analysis result view ───────────────────────────────────────────────── */

function AnalysisView({
  analysis,
  isPaid,
  onRegenerate,
  regenerateDisabled,
}: {
  analysis: MatchAnalysis;
  isPaid: boolean;
  onRegenerate: () => void;
  regenerateDisabled: boolean;
}) {
  const rawGaps = analysis.gaps ?? [];
  const legacyWeaknesses = analysis.weaknesses ?? [];

  const gaps: MatchGap[] =
    rawGaps.length > 0
      ? rawGaps
      : legacyWeaknesses.map((w) => ({
          issue: w,
          severity: "important" as const,
          recommendation:
            "Address or highlight relevant experience for this requirement.",
        }));

  const verdict = getVerdict(analysis.matchScore, gaps);

  const scoreColor =
    verdict.variant === "destructive"
      ? "text-destructive"
      : analysis.matchScore >= 80
        ? "text-emerald-700"
        : "text-primary";

  return (
    <div className="space-y-5">
      {/* Score card */}
      <div className="rounded-lg border border-border bg-card p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Match Score
            </p>
            <div className="flex items-baseline gap-2">
              <span className={`font-serif text-5xl leading-none ${scoreColor}`}>
                {analysis.matchScore}
              </span>
              <span className="text-sm text-muted-foreground">/ 100</span>
            </div>
          </div>
          <div className="flex flex-col items-start sm:items-end gap-2">
            <Badge variant={verdict.variant} className="font-medium">
              {verdict.title}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {verdict.description}
            </span>
            <Button
              size="sm"
              variant="outline"
              onClick={onRegenerate}
              disabled={regenerateDisabled}
              className="mt-1"
            >
              <Sparkles className="mr-1.5 h-3.5 w-3.5" />
              Re-run analysis
            </Button>
          </div>
        </div>
        <Progress value={analysis.matchScore} className="mt-4 h-1.5" />
      </div>

      {/* Strengths + Gaps */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-border bg-card p-5">
          <h2 className="mb-3 text-sm font-semibold text-foreground">
            Strengths
          </h2>
          {analysis.strengths.length > 0 ? (
            <ul className="space-y-2 text-sm">
              {analysis.strengths.map((s, i) => (
                <li key={i} className="flex gap-2">
                  <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/60 mt-[7px]" />
                  <span className="text-muted-foreground">{s}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-muted-foreground">
              No specific strengths listed.
            </p>
          )}
        </div>

        <div className="rounded-lg border border-border bg-card p-5">
          <h2 className="mb-3 text-sm font-semibold text-foreground">
            Gaps to Address
          </h2>
          {gaps.length > 0 ? (
            <div className="space-y-3">
              {gaps.map((g, i) => {
                const isCritical = g.severity === "critical";
                const isImportant = g.severity === "important";
                return (
                  <div
                    key={i}
                    className={`rounded-md border p-3 text-sm space-y-1.5 ${
                      isCritical
                        ? "border-destructive/30 bg-destructive/5"
                        : "border-border bg-background"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-medium text-foreground leading-snug">
                        {g.issue}
                      </p>
                      <span
                        className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                          isCritical
                            ? "bg-destructive/10 text-destructive"
                            : isImportant
                              ? "bg-amber-500/10 text-amber-700"
                              : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {g.severity}
                      </span>
                    </div>
                    {g.recommendation && (
                      <p className="text-xs text-muted-foreground leading-relaxed border-t border-border/50 pt-1.5">
                        <span className="font-medium text-foreground">
                          Action:{" "}
                        </span>
                        {g.recommendation}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">
              No critical or major gaps identified.
            </p>
          )}
        </div>
      </div>

      {!isPaid && (
        <p className="text-xs text-muted-foreground">
          Paid plans save match history so you can compare roles over time.{" "}
          <a href="/profile" className="underline underline-offset-2">
            Upgrade
          </a>
        </p>
      )}
    </div>
  );
}

/* ─── Keywords / CV improvement view ────────────────────────────────────── */

function KeywordsView({
  keywords,
  onRegenerate,
  regenerateDisabled,
}: {
  keywords: KeywordAnalysis;
  onRegenerate: () => void;
  regenerateDisabled: boolean;
}) {
  const rewrites = keywords.suggestedRewrites ?? [];

  async function copyBullet(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard");
    } catch {
      toast.error("Could not copy");
    }
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="border-b border-border px-5 py-5 sm:px-7 sm:py-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Sparkles className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <h2 className="text-lg font-semibold tracking-tight text-foreground">
                CV Improvements
              </h2>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {rewrites.length} targeted {rewrites.length === 1 ? "rewrite" : "rewrites"} for this role
              </p>
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={onRegenerate}
            disabled={regenerateDisabled}
            className="w-full sm:w-auto"
          >
            <Sparkles className="mr-1.5 h-3.5 w-3.5" />
            Regenerate improvements
          </Button>
        </div>
        <p className="mt-4 max-w-2xl text-xs leading-relaxed text-muted-foreground">
          Review every suggestion before using it. ApplyPilot only rewrites
          CV-supported experience.
        </p>
      </div>

      {rewrites.length > 0 ? (
        <div className="divide-y divide-border px-5 sm:px-7">
          {rewrites.map((r, idx) => (
            <article
              key={idx}
              className="grid gap-4 py-7 sm:grid-cols-[2.5rem_minmax(0,1fr)] sm:gap-5 sm:py-8"
            >
              <span className="text-xs font-semibold tabular-nums tracking-[0.18em] text-primary/70">
                {String(idx + 1).padStart(2, "0")}
              </span>
              <div className="min-w-0 max-w-3xl">
                <div>
                  <p className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-primary">
                    Suggested rewrite
                  </p>
                  <p className="mt-2 whitespace-pre-wrap text-base font-medium leading-7 text-foreground sm:text-[1.05rem]">
                    {r.suggested}
                  </p>
                </div>

                {r.targetKeywords && r.targetKeywords.length > 0 && (
                  <div className="mt-4 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs text-muted-foreground">
                    <span className="font-medium text-foreground/70">Relevant to:</span>
                    {r.targetKeywords.map((kw, keywordIndex) => (
                      <span key={kw} className="inline-flex items-center gap-1.5">
                        {keywordIndex > 0 && <span aria-hidden="true">·</span>}
                        <span>{kw}</span>
                      </span>
                    ))}
                  </div>
                )}

                <div className="mt-5 border-l-2 border-border pl-4">
                  <p className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    Original
                  </p>
                  <p className="mt-1.5 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
                    {r.original}
                  </p>
                </div>

                <div className="mt-5 flex justify-end">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyBullet(r.suggested)}
                    className="w-full sm:w-auto"
                  >
                    <Copy className="mr-1.5 h-3.5 w-3.5" />
                    Copy rewrite
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="border-b border-border px-5 py-8 sm:px-7">
          <p className="text-sm text-muted-foreground">
            No high-value CV rewrites were identified for this role.
          </p>
        </div>
      )}

      <div className="border-t border-border bg-muted/20 px-5 py-6 sm:px-7">
        <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Keyword summary
        </h3>
        <div className="mt-4 grid gap-6 md:grid-cols-2 md:gap-8">
          <section>
            <h4 className="mb-2.5 text-sm font-semibold text-foreground">
              Missing Keywords
            </h4>
            {keywords.missingKeywords.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {keywords.missingKeywords.map((k: string) => (
                  <Badge key={k} variant="outline" className="bg-background font-normal">
                    {k}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">
                No missing keywords found.
              </p>
            )}
          </section>

          <section>
            <h4 className="mb-2.5 text-sm font-semibold text-foreground">
              Matched Keywords
            </h4>
            {keywords.matchedKeywords.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {keywords.matchedKeywords.map((k: string) => (
                  <Badge key={k} variant="secondary" className="font-normal">
                    {k}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">
                No matched keywords found.
              </p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

/* ─── Cover letter view ──────────────────────────────────────────────────── */

function LetterView({
  letter,
  onRegenerate,
  isRegenerating,
  regenerateDisabled,
  company,
}: {
  letter: string;
  onRegenerate: (tone?: CoverLetterTone) => void;
  isRegenerating: boolean;
  regenerateDisabled: boolean;
  company?: string;
}) {
  const tones: { key: CoverLetterTone; label: string }[] = [
    { key: "formal", label: "Formal" },
    { key: "warm", label: "Warm" },
    { key: "confident", label: "Confident" },
  ];

  function buildPdf() {
    const doc = new jsPDF({ unit: "pt", format: "letter" });
    const marginX = 56;
    const marginY = 64;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const usableWidth = pageWidth - marginX * 2;
    doc.setFont("times", "normal");
    doc.setFontSize(11);
    const lines = doc.splitTextToSize(letter, usableWidth);
    let y = marginY;
    const lineHeight = 15;
    for (const line of lines) {
      if (y > pageHeight - marginY) {
        doc.addPage();
        y = marginY;
      }
      doc.text(line, marginX, y);
      y += lineHeight;
    }
    const safeCompany = (company || "cover-letter")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "cover-letter";
    doc.save(`${safeCompany}.pdf`);
  }

  function downloadPdf() {
    try {
      buildPdf();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "PDF download failed");
    }
  }

  const safeName =
    (company || "cover-letter")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "cover-letter";

  async function buildDocx() {
    const paragraphs = letter
      .split(/\n/)
      .map(
        (line) =>
          new Paragraph({
            children: [
              new TextRun({ text: line, font: "Calibri", size: 22 }),
            ],
          }),
      );
    const doc = new Document({
      sections: [
        {
          properties: {
            page: {
              size: { width: 12240, height: 15840 },
              margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
            },
          },
          children: paragraphs,
        },
      ],
    });
    const blob = await Packer.toBlob(doc);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${safeName}.docx`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  async function downloadDocx() {
    try {
      await buildDocx();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "DOCX download failed");
    }
  }

  async function copyLetter() {
    try {
      await navigator.clipboard.writeText(letter);
      toast.success("Copied");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not copy");
    }
  }

  const RegenerateButton = (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          size="sm"
          variant="outline"
          disabled={regenerateDisabled || isRegenerating}
        >
          {isRegenerating ? (
            <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
          ) : (
            <Sparkles className="mr-1 h-3.5 w-3.5" />
          )}
          Regenerate
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onRegenerate(undefined)}>
          Balanced
        </DropdownMenuItem>
        {tones.map((t) => (
          <DropdownMenuItem key={t.key} onClick={() => onRegenerate(t.key)}>
            {t.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const DownloadPdfButton = (
    <Button size="sm" variant="outline" onClick={downloadPdf}>
      <Download className="mr-1 h-3.5 w-3.5" />
      PDF
    </Button>
  );

  const DownloadDocxButton = (
    <Button
      size="sm"
      variant="outline"
      onClick={downloadDocx}
    >
      <Download className="mr-1 h-3.5 w-3.5" />
      DOCX
    </Button>
  );

  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="flex flex-col gap-3 border-b border-border px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-sm font-semibold text-foreground">Cover letter</h2>
        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" variant="outline" onClick={copyLetter}>
            <Copy className="mr-1 h-3.5 w-3.5" />
            Copy
          </Button>
          {RegenerateButton}
          {DownloadPdfButton}
          {DownloadDocxButton}
        </div>
      </div>
      <div className="px-5 py-5">
        <div className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
          {letter}
        </div>
      </div>
    </div>
  );
}
