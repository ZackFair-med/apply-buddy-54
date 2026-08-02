import { describe, expect, it, vi } from "vitest";
import { callServerFn, validateInput } from "@/test/server-fn";
import { createSupabaseStub, opsFor } from "@/test/supabase";

vi.mock("@tanstack/react-start", async () => (await import("@/test/server-fn")).reactStartMock());

const deleteUser = vi.fn();
vi.mock("@/integrations/supabase/client.server", () => ({
  supabaseAdmin: { auth: { admin: { deleteUser: (...args: unknown[]) => deleteUser(...args) } } },
}));

const { getProfile, updateProfile, deleteAccount } = await import("./profile.functions");

function contextWith(profiles: { data?: unknown; error?: { message: string } | null }) {
  const stub = createSupabaseStub({ tables: { profiles } });
  return { ...stub, context: { supabase: stub.supabase, userId: "user-1" } };
}

describe("getProfile", () => {
  it("returns the caller's own profile row", async () => {
    const { context, ops } = contextWith({ data: { id: "user-1" }, error: null });
    await expect(callServerFn(getProfile, { context })).resolves.toEqual({ id: "user-1" });
    expect(opsFor(ops, "profiles")).toContainEqual({ name: "eq", args: ["id", "user-1"] });
  });

  it("surfaces query errors", async () => {
    const { context } = contextWith({ error: { message: "db down" } });
    await expect(callServerFn(getProfile, { context })).rejects.toThrow("db down");
  });
});

describe("updateProfile", () => {
  it("omits undefined fields and blanks empty strings to null", async () => {
    const { context, ops } = contextWith({ data: { id: "user-1" }, error: null });
    await callServerFn(updateProfile, {
      data: { first_name: "Ada", last_name: "", weekly_goal: 5 },
      context,
    });
    expect(opsFor(ops, "profiles")).toContainEqual({
      name: "update",
      args: [{ first_name: "Ada", last_name: null, weekly_goal: 5 }],
    });
  });

  it("keeps explicit nulls", async () => {
    const { context, ops } = contextWith({ data: { id: "user-1" }, error: null });
    await callServerFn(updateProfile, { data: { target_title: null }, context });
    expect(opsFor(ops, "profiles")).toContainEqual({
      name: "update",
      args: [{ target_title: null }],
    });
  });

  it("trims string fields", () => {
    expect(validateInput(updateProfile, { display_name: "  Ada  " })).toMatchObject({
      display_name: "Ada",
    });
  });

  it("rejects out-of-range numbers", () => {
    expect(() => validateInput(updateProfile, { weekly_goal: 0 })).toThrow();
    expect(() => validateInput(updateProfile, { target_salary_min: -1 })).toThrow();
    expect(() => validateInput(updateProfile, { target_salary_max: 10_000_001 })).toThrow();
  });

  it("rejects an over-long name", () => {
    expect(() => validateInput(updateProfile, { first_name: "x".repeat(101) })).toThrow();
  });

  it("surfaces update errors", async () => {
    const { context } = contextWith({ error: { message: "nope" } });
    await expect(
      callServerFn(updateProfile, { data: { first_name: "Ada" }, context }),
    ).rejects.toThrow("nope");
  });
});

describe("deleteAccount", () => {
  it("deletes the caller through the admin client", async () => {
    deleteUser.mockResolvedValue({ error: null });
    const { context } = contextWith({ data: null, error: null });
    await expect(callServerFn(deleteAccount, { context })).resolves.toEqual({ ok: true });
    expect(deleteUser).toHaveBeenCalledWith("user-1");
  });

  it("surfaces admin errors", async () => {
    deleteUser.mockResolvedValue({ error: { message: "forbidden" } });
    const { context } = contextWith({ data: null, error: null });
    await expect(callServerFn(deleteAccount, { context })).rejects.toThrow("forbidden");
  });
});
