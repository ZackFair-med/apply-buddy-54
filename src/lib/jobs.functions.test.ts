import { describe, expect, it, vi } from "vitest";
import { callServerFn, reactStartMock, validateInput } from "@/test/server-fn";

vi.mock("@tanstack/react-start", async () => (await import("@/test/server-fn")).reactStartMock());

const { createJob, deleteJob, deleteJobs, getJob, listJobs, updateJob, updateJobsStatus } =
  await import("./jobs.functions");

type Result = { data?: unknown; error?: { message: string } | null };

type Op = { name: string; args: unknown[] };

/**
 * Records the query builder chain and resolves every terminal call (`await`,
 * `.single()`, `.maybeSingle()`) with the same configured result.
 */
function createContext(result: Result = { data: null, error: null }) {
  const ops: Op[] = [];
  const settled = Promise.resolve(result);

  const chain: Record<string, unknown> = {};
  for (const name of ["select", "insert", "update", "delete", "eq", "in", "order"]) {
    chain[name] = (...args: unknown[]) => {
      ops.push({ name, args });
      return chain;
    };
  }
  chain.single = () => settled;
  chain.maybeSingle = () => settled;
  chain.then = settled.then.bind(settled);

  const supabase = {
    from: (table: string) => {
      ops.push({ name: "from", args: [table] });
      return chain;
    },
  };
  return { context: { supabase, userId: "user-1" }, ops };
}

const uuid = "11111111-1111-4111-8111-111111111111";

const validJob = { company: "Acme", title: "Engineer" };

describe("listJobs", () => {
  it("returns jobs newest first", async () => {
    const { context, ops } = createContext({ data: [{ id: uuid }], error: null });
    await expect(callServerFn(listJobs, { context })).resolves.toEqual([{ id: uuid }]);
    expect(ops).toEqual([
      { name: "from", args: ["jobs"] },
      { name: "select", args: ["*"] },
      { name: "order", args: ["created_at", { ascending: false }] },
    ]);
  });

  it("returns an empty list when the query yields no rows", async () => {
    const { context } = createContext({ data: null, error: null });
    await expect(callServerFn(listJobs, { context })).resolves.toEqual([]);
  });

  it("surfaces query errors", async () => {
    const { context } = createContext({ error: { message: "db down" } });
    await expect(callServerFn(listJobs, { context })).rejects.toThrow("db down");
  });
});

describe("getJob", () => {
  it("looks the job up by id", async () => {
    const { context, ops } = createContext({ data: { id: uuid }, error: null });
    await expect(callServerFn(getJob, { data: { id: uuid }, context })).resolves.toEqual({
      id: uuid,
    });
    expect(ops).toContainEqual({ name: "eq", args: ["id", uuid] });
  });

  it("rejects a non-uuid id", () => {
    expect(() => validateInput(getJob, { id: "nope" })).toThrow();
  });

  it("surfaces query errors", async () => {
    const { context } = createContext({ error: { message: "db down" } });
    await expect(callServerFn(getJob, { data: { id: uuid }, context })).rejects.toThrow("db down");
  });
});

describe("createJob input validation", () => {
  it("defaults the status to saved", () => {
    expect(validateInput(createJob, validJob)).toMatchObject({ status: "saved" });
  });

  it("rejects an unknown status", () => {
    expect(() => validateInput(createJob, { ...validJob, status: "ghosted" })).toThrow();
  });

  it("rejects blank company or title", () => {
    expect(() => validateInput(createJob, { company: "", title: "Engineer" })).toThrow();
    expect(() => validateInput(createJob, { company: "Acme", title: "" })).toThrow();
  });

  it("prefixes a bare URL with https", () => {
    expect(validateInput(createJob, { ...validJob, url: " acme.test/jobs/1 " })).toMatchObject({
      url: "https://acme.test/jobs/1",
    });
  });

  it("keeps an http(s) URL as-is", () => {
    expect(validateInput(createJob, { ...validJob, url: "http://acme.test" })).toMatchObject({
      url: "http://acme.test",
    });
  });

  it("normalises an empty URL to null", () => {
    expect(validateInput(createJob, { ...validJob, url: "   " })).toMatchObject({ url: null });
  });

  it("rejects a URL that is still invalid after prefixing", () => {
    expect(() => validateInput(createJob, { ...validJob, url: "https://" })).toThrow();
  });

  it("rejects an over-long job description", () => {
    expect(() =>
      validateInput(createJob, { ...validJob, job_description: "x".repeat(50_001) }),
    ).toThrow();
  });
});

describe("createJob", () => {
  it("stamps the row with the caller's user id", async () => {
    const { context, ops } = createContext({ data: { id: uuid }, error: null });
    await expect(callServerFn(createJob, { data: validJob, context })).resolves.toEqual({
      id: uuid,
    });
    expect(ops).toContainEqual({
      name: "insert",
      args: [{ company: "Acme", title: "Engineer", status: "saved", user_id: "user-1" }],
    });
  });

  it("surfaces insert errors", async () => {
    const { context } = createContext({ error: { message: "duplicate" } });
    await expect(callServerFn(createJob, { data: validJob, context })).rejects.toThrow("duplicate");
  });
});

describe("updateJob", () => {
  it("accepts a partial patch", async () => {
    const { context, ops } = createContext({ data: { id: uuid }, error: null });
    await callServerFn(updateJob, { data: { id: uuid, patch: { status: "offer" } }, context });
    expect(ops).toContainEqual({ name: "update", args: [{ status: "offer" }] });
    expect(ops).toContainEqual({ name: "eq", args: ["id", uuid] });
  });

  it("rejects an invalid field inside the patch", () => {
    expect(() => validateInput(updateJob, { id: uuid, patch: { status: "ghosted" } })).toThrow();
  });

  it("surfaces update errors", async () => {
    const { context } = createContext({ error: { message: "nope" } });
    await expect(
      callServerFn(updateJob, { data: { id: uuid, patch: {} }, context }),
    ).rejects.toThrow("nope");
  });
});

describe("deleteJob", () => {
  it("deletes a single job", async () => {
    const { context, ops } = createContext({ error: null });
    await expect(callServerFn(deleteJob, { data: { id: uuid }, context })).resolves.toEqual({
      ok: true,
    });
    expect(ops).toContainEqual({ name: "delete", args: [] });
  });

  it("surfaces delete errors", async () => {
    const { context } = createContext({ error: { message: "nope" } });
    await expect(callServerFn(deleteJob, { data: { id: uuid }, context })).rejects.toThrow("nope");
  });
});

describe("deleteJobs", () => {
  it("bulk deletes and reports the count", async () => {
    const { context, ops } = createContext({ error: null });
    await expect(callServerFn(deleteJobs, { data: { ids: [uuid] }, context })).resolves.toEqual({
      ok: true,
      count: 1,
    });
    expect(ops).toContainEqual({ name: "in", args: ["id", [uuid]] });
  });

  it("rejects an empty or oversized id list", () => {
    expect(() => validateInput(deleteJobs, { ids: [] })).toThrow();
    expect(() => validateInput(deleteJobs, { ids: Array(501).fill(uuid) })).toThrow();
  });

  it("surfaces delete errors", async () => {
    const { context } = createContext({ error: { message: "nope" } });
    await expect(callServerFn(deleteJobs, { data: { ids: [uuid] }, context })).rejects.toThrow(
      "nope",
    );
  });
});

describe("updateJobsStatus", () => {
  it("moves every id to the new status", async () => {
    const { context, ops } = createContext({ error: null });
    await expect(
      callServerFn(updateJobsStatus, { data: { ids: [uuid], status: "interview" }, context }),
    ).resolves.toEqual({ ok: true, count: 1, status: "interview" });
    expect(ops).toContainEqual({ name: "update", args: [{ status: "interview" }] });
  });

  it("rejects an unknown status", () => {
    expect(() => validateInput(updateJobsStatus, { ids: [uuid], status: "ghosted" })).toThrow();
  });

  it("surfaces update errors", async () => {
    const { context } = createContext({ error: { message: "nope" } });
    await expect(
      callServerFn(updateJobsStatus, { data: { ids: [uuid], status: "offer" }, context }),
    ).rejects.toThrow("nope");
  });
});
