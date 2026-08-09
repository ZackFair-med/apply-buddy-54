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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Gauge, Tags, FileText, Loader2, Copy, Download, Sparkles, Check, AlertCircle } from "lucide-react";
import type { MatchAnalysis, KeywordAnalysis, CoverLetterTone, MatchGap } from "@/lib/ai/types";
import { UpgradePrompt, type UpgradeFeature } from "@/components/UpgradePrompt";
import { UsageIndicator } from "@/components/UsageIndicator";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import jsPDF from "jspdf";
import { Document, Packer, Paragraph, TextRun } from "docx";

export const Route = createFileRoute("/_authenticated/tailor")({
  head: () => ({
    meta: [
      { title: "AI Assistant · ApplyPilot" },
      { name: "description", content: "Paste a job description and get an AI match score, keyword analysis, and a tailored cover letter — each on demand." },
      { property: "og:title", content: "AI Assistant · ApplyPilot" },
      { property: "og:description", content: "AI-tailored cover letters and match analysis." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: TailorPage,
});

type Step = "fit" | "cv" | "letter";

function TailorPage() {
  const list = useServerFn(listCvs);
  const analyzeFn = useServerFn(analyzeMatch);
  const keywordsFn = useServerFn(extractKeywords);
  const letterFn = useServerFn(generateCoverLetter);
  const usageFn = useServerFn(getUsageSummary);
  const { data: cvs = [] } = useQuery({ queryKey: ["cvs"], queryFn: () => list() });
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

  const [contextSnapshot, setContextSnapshot] = useState<{
    cvId: string;
    jd: string;
    title: string;
    company: string;
  } | null>(null);

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
      setContextSnapshot({ cvId, jd, title, company });
      setActiveStep(targetStep);
      scrollWorkspace();
      refetchUsage();
    },
    onError: (e: unknown) => toast.error(e instanceof Error ? e.message : errLabel),
  });

  const runAnalyze = useMutation({
    mutationFn: () => analyzeFn({ data: payload() }),
    ...handleResult<MatchAnalysis>("match_score", "fit", (r) => setAnalysis(r), "Analysis failed"),
  });
  const runKeywords = useMutation({
    mutationFn: () => keywordsFn({ data: payload() }),
    ...handleResult<KeywordAnalysis>("keywords", "cv", (r) => setKeywords(r), "Keyword extraction failed"),
  });
  const runLetter = useMutation({
    mutationFn: (tone?: CoverLetterTone) => letterFn({ data: { ...payload(), tone } }),
    ...handleResult<{ coverLetter: string }>("cover_letter", "letter", (r) => setLetter(r.coverLetter), "Cover letter failed"),
  });

  const disabled = !cvId || jd.length < 30;

  const isStale = Boolean(
    contextSnapshot &&
      (contextSnapshot.cvId !== cvId ||
        contextSnapshot.jd !== jd ||
        contextSnapshot.title !== title ||
        contextSnapshot.company !== company),
  );

  const steps: {
    key: Step;
    label: string;
    icon: typeof Gauge;
    isDone: boolean;
    isLoading: boolean;
    usageInfo?: { used: number; limit: number | null };
  }[] = [
    {
      key: "fit",
      label: "1. Analyze Fit",
      icon: Gauge,
      isDone: Boolean(analysis),
      isLoading: runAnalyze.isPending,
      usageInfo: usage?.matchScore,
    },
    {
      key: "cv",
      label: "2. Improve CV",
      icon: Tags,
      isDone: Boolean(keywords),
      isLoading: runKeywords.isPending,
      usageInfo: usage?.keywords,
    },
    {
      key: "letter",
      label: "3. Cover Letter",
      icon: FileText,
      isDone: Boolean(letter),
      isLoading: runLetter.isPending,
      usageInfo: usage?.coverLetter,
    },
  ];

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="font-serif text-4xl leading-tight text-foreground">AI Assistant</h1>
        <p className="text-base text-muted-foreground">
          Select a CV, paste a job description, and use the 3-step workflow to analyze fit, improve your CV, and generate a cover letter.
        </p>
      </div>

      <Card>
        <CardContent className="space-y-4 py-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2 sm:col-span-1">
              <Label className="text-sm font-medium text-foreground">CV</Label>
              <Select value={cvId} onValueChange={setCvId}>
                <SelectTrigger><SelectValue placeholder="Select a CV" /></SelectTrigger>
                <SelectContent>
                  {cvs.map((c: { id: string; label: string }) => (
                    <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-foreground">Job title (optional)</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-foreground">Company (optional)</Label>
              <Input value={company} onChange={(e) => setCompany(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium text-foreground">Job description</Label>
            <Textarea rows={7} value={jd} onChange={(e) => setJd(e.target.value)} placeholder="Paste the full job posting here…" />
          </div>
        </CardContent>
      </Card>

      {upgrade && (
        <UpgradePrompt
          feature={upgrade}
          onDismiss={() => setUpgrade(null)}
          onUpgrade={() => toast.info("Upgrade flow coming soon")}
        />
      )}

      {/* 3-Step Workflow Navigation Bar */}
      <div className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {steps.map((step) => {
            const Icon = step.icon;
            const isActive = activeStep === step.key;
            return (
              <div key={step.key} className="flex flex-col gap-1">
                <button
                  type="button"
                  onClick={() => setActiveStep(step.key)}
                  className={`flex items-center justify-between p-3.5 rounded-lg border text-left transition-all ${
                    isActive
                      ? "border-primary bg-primary/5 shadow-xs text-foreground font-semibold"
                      : "border-border bg-card hover:bg-accent/50 text-muted-foreground"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon className={`h-4 w-4 shrink-0 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                    <span className="text-sm truncate">{step.label}</span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {step.isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    ) : step.isDone ? (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
                        <Check className="h-3.5 w-3.5" />
                      </span>
                    ) : null}
                  </div>
                </button>
                {step.usageInfo && (
                  <div className="px-1">
                    <UsageIndicator
                      used={step.usageInfo.used}
                      limit={step.usageInfo.limit}
                      unit={step.key === "fit" ? "match scores" : step.key === "cv" ? "keyword runs" : "cover letters"}
                      window={step.key === "letter" ? usage?.coverLetter.window : "day"}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Persistent Workspace Container */}
      <div ref={workspaceRef} className="scroll-mt-6 space-y-6">
        {isStale && (analysis || keywords || letter) && (
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3.5 text-xs text-amber-800 dark:text-amber-300 flex items-center gap-2.5">
            <AlertCircle className="h-4 w-4 shrink-0 text-amber-600" />
            <span>Application details changed. Re-run your desired workflow step to refresh the analysis.</span>
          </div>
        )}

        {activeStep === "fit" && (
          runAnalyze.isPending ? (
            <Card>
              <CardContent className="py-12 flex flex-col items-center justify-center space-y-3">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Evaluating job match & candidate fit…</p>
              </CardContent>
            </Card>
          ) : analysis ? (
            <AnalysisView analysis={analysis} isPaid={usage?.plan === "paid"} />
          ) : (
            <Card className="border-dashed">
              <CardContent className="py-10 text-center space-y-4">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Gauge className="h-6 w-6 text-primary" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-serif text-lg text-foreground">Analyze Fit</h3>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    Analyze this role to see your match score, strengths, and important qualification gaps.
                  </p>
                </div>
                <div className="flex flex-col items-center gap-1 pt-2">
                  <Button onClick={() => runAnalyze.mutate()} disabled={disabled || runAnalyze.isPending}>
                    {runAnalyze.isPending ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Gauge className="mr-1.5 h-4 w-4" />}
                    Analyze Fit
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        )}

        {activeStep === "cv" && (
          runKeywords.isPending ? (
            <Card>
              <CardContent className="py-12 flex flex-col items-center justify-center space-y-3">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Extracting keywords & generating tailored CV bullet rewrites…</p>
              </CardContent>
            </Card>
          ) : keywords ? (
            <KeywordsView keywords={keywords} />
          ) : (
            <Card className="border-dashed">
              <CardContent className="py-10 text-center space-y-4">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Tags className="h-6 w-6 text-primary" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-serif text-lg text-foreground">Improve CV</h3>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    Generate tailored CV improvements and bullet rewrites for this role.
                  </p>
                </div>
                <div className="flex flex-col items-center gap-1 pt-2">
                  <Button onClick={() => runKeywords.mutate()} disabled={disabled || runKeywords.isPending}>
                    {runKeywords.isPending ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Tags className="mr-1.5 h-4 w-4" />}
                    Improve CV
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        )}

        {activeStep === "letter" && (
          runLetter.isPending ? (
            <Card>
              <CardContent className="py-12 flex flex-col items-center justify-center space-y-3">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Writing tailored cover letter…</p>
              </CardContent>
            </Card>
          ) : letter ? (
            <LetterView
              letter={letter}
              isPaid={usage?.plan === "paid"}
              onRegenerate={(tone) => runLetter.mutate(tone)}
              isRegenerating={runLetter.isPending}
              company={company}
            />
          ) : (
            <Card className="border-dashed">
              <CardContent className="py-10 text-center space-y-4">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-serif text-lg text-foreground">Cover Letter</h3>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    Generate a tailored cover letter after reviewing the role.
                  </p>
                </div>
                <div className="flex flex-col items-center gap-1 pt-2">
                  <Button onClick={() => runLetter.mutate(undefined)} disabled={disabled || runLetter.isPending}>
                    {runLetter.isPending ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <FileText className="mr-1.5 h-4 w-4" />}
                    Write Cover Letter
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        )}
      </div>
    </div>
  );
}

function getVerdict(score: number, gaps: MatchGap[]) {
  const criticalCount = gaps.filter((g) => g.severity === "critical").length;

  if (criticalCount > 0) {
    if (score >= 75) {
      return {
        title: "Good Alignment — Critical Gap Exists",
        variant: "destructive" as const,
        description: "Strong overall match, but a mandatory requirement is missing.",
      };
    }
    return {
      title: "Significant Gaps — Critical Requirements Missing",
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
      description: "Solid background with minor keyword or experience adjustments needed.",
    };
  }
  if (score >= 50) {
    return {
      title: "Moderate Fit — Address Key Gaps",
      variant: "outline" as const,
      description: "Meets basic prerequisites but has notable gaps to address.",
    };
  }
  return {
    title: "Significant Gaps",
    variant: "destructive" as const,
    description: "Multiple key qualifications are missing for this position.",
  };
}

function AnalysisView({ analysis, isPaid }: { analysis: MatchAnalysis; isPaid: boolean }) {
  const rawGaps = analysis.gaps ?? [];
  const legacyWeaknesses = analysis.weaknesses ?? [];

  const gaps: MatchGap[] =
    rawGaps.length > 0
      ? rawGaps
      : legacyWeaknesses.map((w) => ({
          issue: w,
          severity: "important",
          recommendation: "Address or highlight relevant experience for this requirement.",
        }));

  const verdict = getVerdict(analysis.matchScore, gaps);

  const scoreColor =
    verdict.variant === "destructive"
      ? "text-destructive font-serif"
      : analysis.matchScore >= 80
      ? "text-emerald-700 font-serif font-semibold"
      : "text-primary font-serif";

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="py-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-1">
                Match Score & Verdict
              </div>
              <div className="flex items-baseline gap-3">
                <div className={`text-5xl sm:text-6xl leading-none ${scoreColor}`}>
                  {analysis.matchScore}
                </div>
                <span className="text-sm font-medium text-muted-foreground">/ 100</span>
              </div>
            </div>
            <div className="flex flex-col items-start sm:items-end gap-1">
              <Badge variant={verdict.variant} className="text-sm px-3 py-1 font-medium">
                {verdict.title}
              </Badge>
              <span className="text-xs text-muted-foreground">{verdict.description}</span>
            </div>
          </div>
          <Progress value={analysis.matchScore} className="h-2" />
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="font-serif text-base text-foreground">Strengths</CardTitle>
          </CardHeader>
          <CardContent>
            {analysis.strengths.length > 0 ? (
              <ul className="list-disc space-y-2 pl-5 text-sm">
                {analysis.strengths.map((s, i) => (
                  <li key={i} className="text-muted-foreground">
                    <span className="text-foreground">{s}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-muted-foreground">No specific strengths listed.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-serif text-base text-foreground">Gaps to Address</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {gaps.length > 0 ? (
              gaps.map((g, i) => {
                const isCritical = g.severity === "critical";
                const isImportant = g.severity === "important";
                return (
                  <div
                    key={i}
                    className={`rounded-lg border p-3.5 space-y-2 text-sm ${
                      isCritical
                        ? "border-destructive/40 bg-destructive/5 shadow-xs"
                        : "bg-card"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="font-medium text-foreground">{g.issue}</div>
                      <Badge
                        variant={isCritical ? "destructive" : isImportant ? "outline" : "secondary"}
                        className={`text-[10px] uppercase font-semibold shrink-0 ${
                          isImportant ? "border-amber-500/50 text-amber-700 bg-amber-500/10" : ""
                        }`}
                      >
                        {g.severity} gap
                      </Badge>
                    </div>
                    {g.recommendation && (
                      <p className="text-xs text-muted-foreground leading-relaxed pt-0.5 border-t border-border/50">
                        <strong className="font-medium text-foreground">Action:</strong>{" "}
                        {g.recommendation}
                      </p>
                    )}
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-muted-foreground">No critical or major gaps identified.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {!isPaid && (
        <p className="text-xs text-muted-foreground">
          Paid plans save your match history so you can compare jobs later.{" "}
          <a href="/profile" className="underline underline-offset-2">
            Upgrade
          </a>
        </p>
      )}
    </div>
  );
}

function KeywordsView({ keywords }: { keywords: KeywordAnalysis }) {
  const rewrites = keywords.suggestedRewrites ?? [];

  async function copyBullet(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied bullet to clipboard");
    } catch (e) {
      toast.error("Could not copy bullet");
    }
  }

  return (
    <div className="space-y-6">
      {/* 1. Suggested CV Bullet Rewrites (Visually Dominant) */}
      {rewrites.length > 0 && (
        <Card className="border-primary/20 bg-card shadow-xs">
          <CardHeader>
            <CardTitle className="font-serif text-base text-foreground flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              Suggested CV bullet rewrites
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {rewrites.map((r, idx) => (
              <div key={idx} className="rounded-lg border bg-card p-4 space-y-3">
                {r.targetKeywords && r.targetKeywords.length > 0 && (
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-medium text-muted-foreground">Integrates missing skills:</span>
                    {r.targetKeywords.map((kw) => (
                      <Badge key={kw} variant="secondary" className="text-xs font-normal">
                        {kw}
                      </Badge>
                    ))}
                  </div>
                )}
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1">
                      Original CV bullet
                    </span>
                    <div className="rounded-md bg-muted/50 p-2.5 text-xs text-muted-foreground font-mono whitespace-pre-wrap border">
                      {r.original}
                    </div>
                  </div>
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-primary block mb-1">
                      Suggested tailored bullet
                    </span>
                    <div className="rounded-md bg-primary/5 p-2.5 text-sm text-foreground border border-primary/20 whitespace-pre-wrap font-medium">
                      {r.suggested}
                    </div>
                  </div>
                </div>
                <div className="flex justify-end pt-1">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyBullet(r.suggested)}
                  >
                    <Copy className="mr-1.5 h-3.5 w-3.5" /> Copy suggested bullet
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* 2. Missing Keywords and 3. Matched Keywords */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="font-serif text-base text-foreground">Missing keywords</CardTitle></CardHeader>
          <CardContent className="flex flex-wrap gap-1.5">
            {keywords.missingKeywords.length > 0 ? (
              keywords.missingKeywords.map((k: string) => <Badge key={k} variant="outline">{k}</Badge>)
            ) : (
              <p className="text-xs text-muted-foreground">No missing keywords found.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="font-serif text-base text-foreground">Matched keywords</CardTitle></CardHeader>
          <CardContent className="flex flex-wrap gap-1.5">
            {keywords.matchedKeywords.length > 0 ? (
              keywords.matchedKeywords.map((k: string) => <Badge key={k} variant="secondary">{k}</Badge>)
            ) : (
              <p className="text-xs text-muted-foreground">No matched keywords found.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function LetterView({
  letter,
  isPaid,
  onRegenerate,
  isRegenerating,
  company,
}: {
  letter: string;
  isPaid: boolean;
  onRegenerate: (tone: CoverLetterTone) => void;
  isRegenerating: boolean;
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
    const safeCompany = (company || "cover-letter").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "cover-letter";
    doc.save(`${safeCompany}.pdf`);
  }

  function downloadPdf() {
    try {
      buildPdf();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "PDF download failed");
    }
  }

  const safeName = (company || "cover-letter").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "cover-letter";

  async function buildDocx() {
    const paragraphs = letter.split(/\n/).map(
      (line) => new Paragraph({ children: [new TextRun({ text: line, font: "Calibri", size: 22 })] }),
    );
    const doc = new Document({
      sections: [{
        properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } },
        children: paragraphs,
      }],
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
      toast.error(e instanceof Error ? e.message : "Could not copy to clipboard");
    }
  }

  const RegenerateButton = (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="sm" variant="outline" disabled={!isPaid || isRegenerating}>
          {isRegenerating ? (
            <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
          ) : (
            <Sparkles className="mr-1 h-3.5 w-3.5" />
          )}
          Regenerate with tone
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {tones.map((t) => (
          <DropdownMenuItem key={t.key} onClick={() => onRegenerate(t.key)}>
            {t.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const DownloadPdfButton = (
    <Button size="sm" variant="outline" disabled={!isPaid} onClick={downloadPdf}>
      <Download className="mr-1 h-3.5 w-3.5" /> PDF
    </Button>
  );

  const DownloadDocxButton = (
    <Button size="sm" variant="outline" disabled={!isPaid} onClick={downloadDocx}>
      <Download className="mr-1 h-3.5 w-3.5" /> DOCX
    </Button>
  );

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between gap-2">
        <CardTitle className="font-serif text-base text-foreground">Cover letter</CardTitle>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={copyLetter}
          >
            <Copy className="mr-1 h-3.5 w-3.5" /> Copy
          </Button>
          {isPaid ? (
            <>
              {RegenerateButton}
              {DownloadPdfButton}
              {DownloadDocxButton}
            </>
          ) : (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild><span tabIndex={0}>{RegenerateButton}</span></TooltipTrigger>
                <TooltipContent>Upgrade to regenerate with different tones</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild><span tabIndex={0}>{DownloadPdfButton}</span></TooltipTrigger>
                <TooltipContent>Upgrade to download as PDF</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild><span tabIndex={0}>{DownloadDocxButton}</span></TooltipTrigger>
                <TooltipContent>Upgrade to download as DOCX</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="whitespace-pre-wrap text-sm leading-relaxed">{letter}</div>
      </CardContent>
    </Card>
  );
}
