import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { callServerFn } from "@/test/server-fn";
import { createSupabaseStub, opsFor } from "@/test/supabase";

vi.mock("@tanstack/react-start", async () => (await import("@/test/server-fn")).reactStartMock());

const { getUsageSummary } = await import("./usage.functions");

function contextFor(plan: string | null, counts: { cvs: number; usage: number }) {
  const stub = createSupabaseStub({
    tables: {
      profiles: { data: plan === null ? null : { plan }, error: null },
      cvs: { count: counts.cvs, error: null },
      usage_logs: { count: counts.usage, error: null },
    },
  });
  return { ...stub, context: { supabase: stub.supabase, userId: "user-1" } };
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-03-10T15:30:00.000Z"));
});

afterEach(() => {
  vi.useRealTimers();
});

describe("getUsageSummary", () => {
  it("reports free limits with a weekly cover-letter window", async () => {
    const { context } = contextFor("free", { cvs: 1, usage: 2 });
    await expect(callServerFn(getUsageSummary, { context })).resolves.toEqual({
      plan: "free",
      cvProfiles: { used: 1, limit: 1 },
      matchScore: { used: 2, limit: 3, window: "day" },
      keywords: { used: 2, limit: 2, window: "day" },
      coverLetter: { used: 2, limit: 1, window: "week" },
    });
  });

  it("reports paid limits with a daily cover-letter window", async () => {
    const { context } = contextFor("paid", { cvs: 3, usage: 4 });
    await expect(callServerFn(getUsageSummary, { context })).resolves.toEqual({
      plan: "paid",
      cvProfiles: { used: 3, limit: 5 },
      matchScore: { used: 4, limit: null, window: "day" },
      keywords: { used: 4, limit: null, window: "day" },
      coverLetter: { used: 4, limit: 15, window: "day" },
    });
  });

  it("treats a missing profile as the free plan", async () => {
    const { context } = contextFor(null, { cvs: 0, usage: 0 });
    await expect(callServerFn(getUsageSummary, { context })).resolves.toMatchObject({
      plan: "free",
    });
  });

  it("counts daily usage from midnight UTC and weekly usage from 7 days back", async () => {
    const { context, ops } = contextFor("free", { cvs: 0, usage: 0 });
    await callServerFn(getUsageSummary, { context });

    const gteValues = opsFor(ops, "usage_logs")
      .filter((op) => op.name === "gte")
      .map((op) => op.args[1]);
    expect(gteValues).toEqual([
      "2026-03-10T00:00:00.000Z",
      "2026-03-10T00:00:00.000Z",
      "2026-03-03T15:30:00.000Z",
    ]);
  });
});
