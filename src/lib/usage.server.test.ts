import type { SupabaseClient } from "@supabase/supabase-js";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  CvLimitReachedError,
  LimitReachedError,
  enforceAiLimit,
  enforceCvLimit,
  getUserPlan,
  logUsage,
} from "./usage.server";

type CountResult = { count: number | null; error: { message: string } | null };

type FakeOptions = {
  plan?: string | null;
  counts?: Partial<Record<string, CountResult>>;
};

type Filter = { column: string; value: unknown };

type Recorded = { table: string; filters: Filter[]; gte?: Filter; inserted?: unknown };

/**
 * Minimal stand-in for the Supabase query builder: every filter returns `this`
 * and the terminal shape depends on the table being queried.
 */
function createFakeSupabase(options: FakeOptions = {}) {
  const calls: Recorded[] = [];

  const client = {
    from(table: string) {
      const record: Recorded = { table, filters: [] };
      calls.push(record);
      const countResult: CountResult = options.counts?.[table] ?? { count: 0, error: null };

      const builder = {
        select: () => builder,
        insert: (values: unknown) => {
          record.inserted = values;
          return Promise.resolve({ error: null });
        },
        eq: (column: string, value: unknown) => {
          record.filters.push({ column, value });
          return builder;
        },
        gte: (column: string, value: unknown) => {
          record.gte = { column, value };
          return Promise.resolve(countResult);
        },
        maybeSingle: () =>
          Promise.resolve({
            data: options.plan === undefined ? null : { plan: options.plan },
            error: null,
          }),
        then: (resolve: (value: CountResult) => unknown, reject?: (reason: unknown) => unknown) =>
          Promise.resolve(countResult).then(resolve, reject),
      };
      return builder;
    },
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return { supabase: client as unknown as SupabaseClient<any>, calls };
}

describe("getUserPlan", () => {
  it("returns paid only for an exact paid plan value", async () => {
    const { supabase, calls } = createFakeSupabase({ plan: "paid" });
    await expect(getUserPlan(supabase, "user-1")).resolves.toBe("paid");
    expect(calls[0]).toMatchObject({
      table: "profiles",
      filters: [{ column: "id", value: "user-1" }],
    });
  });

  it.each([["free"], ["Paid"], [null], [undefined]])("falls back to free for %s", async (plan) => {
    const { supabase } = createFakeSupabase({ plan });
    await expect(getUserPlan(supabase, "user-1")).resolves.toBe("free");
  });
});

describe("enforceAiLimit", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-10T15:30:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("allows a free user below the daily match-score limit", async () => {
    const { supabase, calls } = createFakeSupabase({
      plan: "free",
      counts: { usage_logs: { count: 2, error: null } },
    });
    await expect(enforceAiLimit(supabase, "user-1", "match_score")).resolves.toBe("free");
    expect(calls[1].gte).toEqual({ column: "created_at", value: "2026-03-10T00:00:00.000Z" });
  });

  it("throws once the free daily match-score limit is reached", async () => {
    const { supabase } = createFakeSupabase({
      plan: "free",
      counts: { usage_logs: { count: 3, error: null } },
    });
    const error = await enforceAiLimit(supabase, "user-1", "match_score").catch((e) => e);
    expect(error).toBeInstanceOf(LimitReachedError);
    expect(error).toMatchObject({
      code: "LIMIT_REACHED",
      task: "match_score",
      limit: 3,
      window: "day",
      plan: "free",
    });
    expect(error.message).toContain("match_score limit of 3 per day");
  });

  it("meters free cover letters over a rolling week", async () => {
    const { supabase, calls } = createFakeSupabase({
      plan: "free",
      counts: { usage_logs: { count: 0, error: null } },
    });
    await enforceAiLimit(supabase, "user-1", "cover_letter");
    expect(calls[1].gte).toEqual({ column: "created_at", value: "2026-03-03T15:30:00.000Z" });
    expect(calls[1].filters).toEqual([
      { column: "user_id", value: "user-1" },
      { column: "task_type", value: "cover_letter" },
    ]);
  });

  it("meters paid cover letters daily", async () => {
    const { supabase } = createFakeSupabase({
      plan: "paid",
      counts: { usage_logs: { count: 15, error: null } },
    });
    await expect(enforceAiLimit(supabase, "user-1", "cover_letter")).rejects.toMatchObject({
      window: "day",
      limit: 15,
      plan: "paid",
    });
  });

  it("skips the usage query for unlimited tasks", async () => {
    const { supabase, calls } = createFakeSupabase({ plan: "paid" });
    await expect(enforceAiLimit(supabase, "user-1", "keywords")).resolves.toBe("paid");
    expect(calls).toHaveLength(1);
  });

  it("treats a missing count as zero usage", async () => {
    const { supabase } = createFakeSupabase({
      plan: "free",
      counts: { usage_logs: { count: null, error: null } },
    });
    await expect(enforceAiLimit(supabase, "user-1", "keywords")).resolves.toBe("free");
  });

  it("surfaces query errors", async () => {
    const { supabase } = createFakeSupabase({
      plan: "free",
      counts: { usage_logs: { count: null, error: { message: "boom" } } },
    });
    await expect(enforceAiLimit(supabase, "user-1", "keywords")).rejects.toThrow("boom");
  });
});

describe("enforceCvLimit", () => {
  it("allows a free user with no CVs", async () => {
    const { supabase, calls } = createFakeSupabase({
      plan: "free",
      counts: { cvs: { count: 0, error: null } },
    });
    await expect(enforceCvLimit(supabase, "user-1")).resolves.toBeUndefined();
    expect(calls[1]).toMatchObject({
      table: "cvs",
      filters: [{ column: "user_id", value: "user-1" }],
    });
  });

  it("throws with a singular message at the free limit", async () => {
    const { supabase } = createFakeSupabase({
      plan: "free",
      counts: { cvs: { count: 1, error: null } },
    });
    const error = await enforceCvLimit(supabase, "user-1").catch((e) => e);
    expect(error).toBeInstanceOf(CvLimitReachedError);
    expect(error.message).toContain("up to 1 CV on the free plan");
  });

  it("throws with a plural message at the paid limit", async () => {
    const { supabase } = createFakeSupabase({
      plan: "paid",
      counts: { cvs: { count: 5, error: null } },
    });
    await expect(enforceCvLimit(supabase, "user-1")).rejects.toThrow(
      "up to 5 CVs on the paid plan",
    );
  });

  it("surfaces query errors", async () => {
    const { supabase } = createFakeSupabase({
      plan: "free",
      counts: { cvs: { count: null, error: { message: "nope" } } },
    });
    await expect(enforceCvLimit(supabase, "user-1")).rejects.toThrow("nope");
  });
});

describe("logUsage", () => {
  it("inserts a usage row for the task", async () => {
    const { supabase, calls } = createFakeSupabase();
    await logUsage(supabase, "user-1", "keywords");
    expect(calls[0]).toMatchObject({
      table: "usage_logs",
      inserted: { user_id: "user-1", task_type: "keywords" },
    });
  });
});
