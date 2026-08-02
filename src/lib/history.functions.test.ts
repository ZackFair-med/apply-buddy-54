import { describe, expect, it, vi } from "vitest";
import { callServerFn } from "@/test/server-fn";
import { createSupabaseStub, opsFor, type SupabaseStubOptions } from "@/test/supabase";

vi.mock("@tanstack/react-start", async () => (await import("@/test/server-fn")).reactStartMock());

const { listMatchHistory } = await import("./history.functions");

function contextWith(tables: SupabaseStubOptions["tables"]) {
  const stub = createSupabaseStub({ tables });
  return { ...stub, context: { supabase: stub.supabase, userId: "user-1" } };
}

const row = {
  id: "h1",
  cv_id: "cv1",
  job_id: null,
  job_title: "Engineer",
  company: "Acme",
  match_score: 72,
  strengths: ["s"],
  weaknesses: null,
  created_at: "2026-03-01T00:00:00Z",
  cvs: { label: "Main CV" },
};

describe("listMatchHistory", () => {
  it("returns nothing for free users without querying history", async () => {
    const { context, ops } = contextWith({ profiles: { data: { plan: "free" }, error: null } });
    await expect(callServerFn(listMatchHistory, { context })).resolves.toEqual({
      paid: false,
      items: [],
    });
    expect(opsFor(ops, "match_history")).toEqual([]);
  });

  it("flattens the joined CV label and defaults missing bullet lists", async () => {
    const { context } = contextWith({
      profiles: { data: { plan: "paid" }, error: null },
      match_history: { data: [row, { ...row, id: "h2", cvs: null }], error: null },
    });
    const result = await callServerFn<{ paid: boolean; items: { cv_label: string | null }[] }>(
      listMatchHistory,
      { context },
    );
    expect(result.paid).toBe(true);
    expect(result.items[0]).toMatchObject({
      cv_label: "Main CV",
      weaknesses: [],
      strengths: ["s"],
    });
    expect(result.items[1]).toMatchObject({ cv_label: null });
  });

  it("caps the query at the 500 most recent rows for the caller", async () => {
    const { context, ops } = contextWith({
      profiles: { data: { plan: "paid" }, error: null },
      match_history: { data: null, error: null },
    });
    await expect(callServerFn(listMatchHistory, { context })).resolves.toEqual({
      paid: true,
      items: [],
    });
    const historyOps = opsFor(ops, "match_history");
    expect(historyOps).toContainEqual({ name: "eq", args: ["user_id", "user-1"] });
    expect(historyOps).toContainEqual({
      name: "order",
      args: ["created_at", { ascending: false }],
    });
    expect(historyOps).toContainEqual({ name: "limit", args: [500] });
  });

  it("surfaces history query errors", async () => {
    const { context } = contextWith({
      profiles: { data: { plan: "paid" }, error: null },
      match_history: { error: { message: "db down" } },
    });
    await expect(callServerFn(listMatchHistory, { context })).rejects.toThrow("db down");
  });
});
