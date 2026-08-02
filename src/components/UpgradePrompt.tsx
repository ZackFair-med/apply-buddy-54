import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, X } from "lucide-react";

export type UpgradeFeature = "match_score" | "keywords" | "cover_letter" | "cv_profiles";

const COPY: Record<UpgradeFeature, { title: string; body: string }> = {
  match_score: {
    title: "You've used today's free match scores",
    body: "Free plan includes 3 match analyses per day. Upgrade for unlimited daily match scores plus keyword extraction.",
  },
  keywords: {
    title: "You've used today's free keyword runs",
    body: "Free plan includes 2 keyword extractions per day. Upgrade for unlimited keyword analysis across every job.",
  },
  cover_letter: {
    title: "You've used this week's free cover letter",
    body: "Free plan includes 1 cover letter per week. Upgrade for 15/day plus tone regeneration and PDF export.",
  },
  cv_profiles: {
    title: "You've reached your CV limit",
    body: "Free plan stores 1 CV. Upgrade to keep up to 5 tailored CV versions.",
  },
};

export function UpgradePrompt({
  feature,
  onDismiss,
  onUpgrade,
}: {
  feature: UpgradeFeature;
  onDismiss?: () => void;
  onUpgrade?: () => void;
}) {
  const copy = COPY[feature];
  return (
    <Card className="border-primary/30 bg-primary/5">
      <CardContent className="flex items-start gap-3 py-4">
        <div className="mt-0.5 rounded-md bg-primary/10 p-2 text-primary">
          <Sparkles className="h-4 w-4" />
        </div>
        <div className="flex-1 space-y-1">
          <div className="font-medium">{copy.title}</div>
          <p className="text-sm text-muted-foreground">{copy.body}</p>
          <div className="flex gap-2 pt-2">
            <Button size="sm" onClick={onUpgrade}>Upgrade to Paid</Button>
            {onDismiss && (
              <Button size="sm" variant="ghost" onClick={onDismiss}>Not now</Button>
            )}
          </div>
        </div>
        {onDismiss && (
          <button
            aria-label="Dismiss"
            onClick={onDismiss}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </CardContent>
    </Card>
  );
}
