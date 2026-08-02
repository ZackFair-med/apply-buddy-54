import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
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
import { Gauge, Tags, FileText, Loader2, Copy, Download, Sparkles } from "lucide-react";
import type { MatchAnalysis, KeywordAnalysis, CoverLetterTone } from "@/lib/ai/types";
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

  const [analysis, setAnalysis] = useState<MatchAnalysis | null>(null);
  const [keywords, setKeywords] = useState<KeywordAnalysis | null>(null);
  const [letter, setLetter] = useState<string | null>(null);
  const [upgrade, setUpgrade] = useState<UpgradeFeature | null>(null);

  const payload = () => ({
    cvId,
    jobDescription: jd,
    jobTitle: title || undefined,
    company: company || undefined,
  });

  const handleResult = <T,>(
    feature: UpgradeFeature,
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
      refetchUsage();
    },
    onError: (e: unknown) => toast.error(e instanceof Error ? e.message : errLabel),
  });

  const runAnalyze = useMutation({
    mutationFn: () => analyzeFn({ data: payload() }),
    ...handleResult<MatchAnalysis>("match_score", (r) => setAnalysis(r), "Analysis failed"),
  });
  const runKeywords = useMutation({
    mutationFn: () => keywordsFn({ data: payload() }),
    ...handleResult<KeywordAnalysis>("keywords", (r) => setKeywords(r), "Keyword extraction failed"),
  });
  const runLetter = useMutation({
    mutationFn: (tone?: CoverLetterTone) => letterFn({ data: { ...payload(), tone } }),
    ...handleResult<{ coverLetter: string }>("cover_letter", (r) => setLetter(r.coverLetter), "Cover letter failed"),
  });


  const disabled = !cvId || jd.length < 30;


  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="font-serif text-4xl leading-tight text-foreground">AI Assistant</h1>
        <p className="text-base text-muted-foreground">
          Pick a CV, paste a job description, then run only what you need — score, keywords, or cover letter.
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
            <Textarea rows={8} value={jd} onChange={(e) => setJd(e.target.value)} placeholder="Paste the full job posting here…" />
          </div>

          <div className="grid gap-4 pt-2 sm:grid-cols-3">
            <div className="flex flex-col items-start gap-1">
              <Button
                variant="default"
                onClick={() => runAnalyze.mutate()}
                disabled={disabled || runAnalyze.isPending}
              >
                {runAnalyze.isPending ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Gauge className="mr-1 h-4 w-4" />}
                {analysis ? "Re-analyze match" : "Analyze match"}
              </Button>
              {usage && (
                <UsageIndicator used={usage.matchScore.used} limit={usage.matchScore.limit} unit="match scores" window="day" />
              )}
            </div>
            <div className="flex flex-col items-start gap-1">
              <Button
                variant="outline"
                onClick={() => runKeywords.mutate()}
                disabled={disabled || runKeywords.isPending}
              >
                {runKeywords.isPending ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Tags className="mr-1 h-4 w-4" />}
                {keywords ? "Re-run keywords" : "Suggest keywords"}
              </Button>
              {usage && (
                <UsageIndicator used={usage.keywords.used} limit={usage.keywords.limit} unit="keyword runs" window="day" />
              )}
            </div>
            <div className="flex flex-col items-start gap-1">
              <Button
                variant="outline"
                onClick={() => runLetter.mutate(undefined)}
                disabled={disabled || runLetter.isPending}
              >
                {runLetter.isPending ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <FileText className="mr-1 h-4 w-4" />}
                {letter ? "Rewrite cover letter" : "Write cover letter"}
              </Button>
              {usage && (
                <UsageIndicator used={usage.coverLetter.used} limit={usage.coverLetter.limit} unit="cover letters" window={usage.coverLetter.window} />
              )}
            </div>
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

      {analysis && <AnalysisView analysis={analysis} isPaid={usage?.plan === "paid"} />}
      {keywords && <KeywordsView keywords={keywords} />}
      {letter && (
        <LetterView
          letter={letter}
          isPaid={usage?.plan === "paid"}
          onRegenerate={(tone) => runLetter.mutate(tone)}
          isRegenerating={runLetter.isPending}
          company={company}
        />
      )}

    </div>

  );
}

function AnalysisView({ analysis, isPaid }: { analysis: MatchAnalysis; isPaid: boolean }) {
  const scoreColor =
    analysis.matchScore >= 75 ? "text-emerald-700" :
    analysis.matchScore >= 50 ? "text-primary" : "text-destructive";
  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="py-6">
          <div className="flex items-baseline justify-between">
            <div>
              <div className="font-serif text-base text-foreground">Match score</div>
              <div className={`font-serif text-6xl leading-none ${scoreColor}`}>{analysis.matchScore}</div>
            </div>
            <div className="text-sm text-muted-foreground">/ 100</div>
          </div>
          <Progress value={analysis.matchScore} className="mt-4" />
        </CardContent>
      </Card>
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="font-serif text-base text-foreground">Strengths</CardTitle></CardHeader>
          <CardContent>
            <ul className="list-disc space-y-1 pl-5 text-sm">
              {analysis.strengths.map((s, i) => <li key={i}>{s}</li>)}
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="font-serif text-base text-foreground">Weaknesses</CardTitle></CardHeader>
          <CardContent>
            <ul className="list-disc space-y-1 pl-5 text-sm">
              {analysis.weaknesses.map((s, i) => <li key={i}>{s}</li>)}
            </ul>
          </CardContent>
        </Card>
      </div>
      {!isPaid && (
        <p className="text-xs text-muted-foreground">
          Paid plans save your match history so you can compare jobs later.{" "}
          <a href="/profile" className="underline underline-offset-2">Upgrade</a>
        </p>
      )}
    </div>
  );
}

function KeywordsView({ keywords }: { keywords: KeywordAnalysis }) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader><CardTitle className="font-serif text-base text-foreground">Matched keywords</CardTitle></CardHeader>
        <CardContent className="flex flex-wrap gap-1.5">
          {keywords.matchedKeywords.map((k: string) => <Badge key={k} variant="secondary">{k}</Badge>)}
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="font-serif text-base text-foreground">Missing keywords</CardTitle></CardHeader>
        <CardContent className="flex flex-wrap gap-1.5">
          {keywords.missingKeywords.map((k: string) => <Badge key={k} variant="outline">{k}</Badge>)}
        </CardContent>
      </Card>
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
