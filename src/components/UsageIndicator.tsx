export function UsageIndicator({
  used,
  limit,
  unit,
  window,
}: {
  used: number;
  limit: number | null;
  unit: string;
  window?: "day" | "week";
}) {
  if (limit == null) {
    return <span className="text-xs text-muted-foreground">Unlimited {unit}</span>;
  }
  const left = Math.max(0, limit - used);
  const suffix = window ? ` ${window === "day" ? "today" : "this week"}` : "";
  const tone = left === 0 ? "text-destructive" : left <= 1 ? "text-amber-700" : "text-muted-foreground";
  return (
    <span className={`text-xs ${tone}`}>
      {left} of {limit} {unit} left{suffix}
    </span>
  );
}
