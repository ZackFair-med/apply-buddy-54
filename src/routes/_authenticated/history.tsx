import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import { listMatchHistory, type MatchHistoryItem } from "@/lib/history.functions";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Sparkles, ArrowUpDown } from "lucide-react";

export const Route = createFileRoute("/_authenticated/history")({
  head: () => ({
    meta: [
      { title: "Match History · ApplyPilot" },
      { name: "description", content: "Compare past AI match scores across jobs and CVs." },
      { property: "og:title", content: "Match History · ApplyPilot" },
      { property: "og:description", content: "Compare past AI match scores across jobs and CVs." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: HistoryPage,
});

type SortKey = "date" | "score";

function HistoryPage() {
  const fn = useServerFn(listMatchHistory);
  const { data, isLoading } = useQuery({
    queryKey: ["match-history"],
    queryFn: () => fn(),
  });
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [asc, setAsc] = useState(false);

  const items = useMemo(() => {
    const arr = [...(data?.items ?? [])];
    arr.sort((a, b) => {
      const v =
        sortKey === "score"
          ? a.match_score - b.match_score
          : new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      return asc ? v : -v;
    });
    return arr;
  }, [data, sortKey, asc]);

  const toggle = (k: SortKey) => {
    if (sortKey === k) setAsc((v) => !v);
    else {
      setSortKey(k);
      setAsc(k === "date" ? false : false);
    }
  };

  if (isLoading) {
    return <div className="text-sm text-muted-foreground">Loading history…</div>;
  }

  if (data && !data.paid) {
    return <PaidOnlyEmptyState />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl">Match History</h1>
        <p className="text-sm text-muted-foreground">
          Every match analysis you've run, so you can compare which jobs fit best.
        </p>
      </div>

      {items.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            No matches yet. Run an analysis from the AI Assistant to start building your history.
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <button className="inline-flex items-center gap-1" onClick={() => toggle("score")}>
                      Score <ArrowUpDown className="h-3.5 w-3.5" />
                    </button>
                  </TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>CV</TableHead>
                  <TableHead>
                    <button className="inline-flex items-center gap-1" onClick={() => toggle("date")}>
                      Date <ArrowUpDown className="h-3.5 w-3.5" />
                    </button>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((m) => (
                  <Row key={m.id} m={m} />
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function Row({ m }: { m: MatchHistoryItem }) {
  const color =
    m.match_score >= 75 ? "text-emerald-700" :
    m.match_score >= 50 ? "text-primary" : "text-destructive";
  return (
    <TableRow>
      <TableCell className={`font-serif text-xl ${color}`}>{m.match_score}</TableCell>
      <TableCell className="font-medium">{m.job_title || <span className="text-muted-foreground">—</span>}</TableCell>
      <TableCell>{m.company || <span className="text-muted-foreground">—</span>}</TableCell>
      <TableCell>
        {m.cv_label ? <Badge variant="secondary">{m.cv_label}</Badge> : <span className="text-muted-foreground">—</span>}
      </TableCell>
      <TableCell className="text-sm text-muted-foreground">
        {new Date(m.created_at).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}
      </TableCell>
    </TableRow>
  );
}

function PaidOnlyEmptyState() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl">Match History</h1>
      </div>
      <Card>
        <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Sparkles className="h-6 w-6" />
          </div>
          <div className="max-w-md space-y-1">
            <h2 className="font-serif text-xl">A paid feature</h2>
            <p className="text-sm text-muted-foreground">
              Paid plans save every match analysis so you can compare which jobs you fit best over time.
            </p>
          </div>
          <Button asChild>
            <Link to="/profile">Upgrade</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
