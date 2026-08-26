import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { callServerFn, validateInput } from "@/test/server-fn";
import { createSupabaseStub, opsFor, type SupabaseStubOptions } from "@/test/supabase";

vi.mock("@tanstack/react-start", async () => (await import("@/test/server-fn")).reactStartMock());

const enforceCvLimit = vi.fn();
vi.mock("./usage.server", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./usage.server")>();
  return {
    ...actual,
    enforceCvLimit: (...args: unknown[]) => enforceCvLimit(...args),
  };
});

const extractCvText = vi.fn();
vi.mock("./cv-parser.server", () => ({
  extractCvText: (...args: unknown[]) => extractCvText(...args),
}));

const { listCvs, uploadCv, updateCv, deleteCv, downloadCv } = await import("./cvs.functions");

const CV_ID = "11111111-1111-4111-8111-111111111111";

function contextWith(options: SupabaseStubOptions = {}) {
  const stub = createSupabaseStub(options);
  return { ...stub, context: { supabase: stub.supabase, userId: "user-1" } };
}

const upload = {
  label: "Main CV",
  tags: ["frontend"],
  fileName: "my cv (final).pdf",
  mimeType: "application/pdf",
  base64: Buffer.from("pdf-bytes").toString("base64"),
};

beforeEach(() => {
  enforceCvLimit.mockResolvedValue(undefined);
  extractCvText.mockResolvedValue("CV text");
  vi.stubGlobal("crypto", { randomUUID: () => "object-id" });
});

afterEach(() => {
  vi.clearAllMocks();
  vi.unstubAllGlobals();
});

describe("listCvs", () => {
  it("returns CVs newest first", async () => {
    const { context, ops } = contextWith({
      tables: { cvs: { data: [{ id: CV_ID }], error: null } },
    });
    await expect(callServerFn(listCvs, { context })).resolves.toEqual([{ id: CV_ID }]);
    expect(opsFor(ops, "cvs")).toContainEqual({
      name: "order",
      args: ["created_at", { ascending: false }],
    });
  });

  it("returns an empty list when there are no rows", async () => {
    const { context } = contextWith({ tables: { cvs: { data: null, error: null } } });
    await expect(callServerFn(listCvs, { context })).resolves.toEqual([]);
  });

  it("surfaces query errors", async () => {
    const { context } = contextWith({ tables: { cvs: { error: { message: "db down" } } } });
    await expect(callServerFn(listCvs, { context })).rejects.toThrow("db down");
  });
});

describe("uploadCv", () => {
  it("stores the file under the user folder and saves the parsed text", async () => {
    const { context, ops, storage } = contextWith({
      tables: { cvs: { data: { id: CV_ID }, error: null } },
    });
    await expect(callServerFn(uploadCv, { data: upload, context })).resolves.toEqual({
      id: CV_ID,
    });

    expect(storage.upload).toHaveBeenCalledWith(
      "user-1/object-id-my_cv_final_.pdf",
      expect.any(Buffer),
      { contentType: "application/pdf", upsert: false },
    );
    expect(opsFor(ops, "cvs")).toContainEqual({
      name: "insert",
      args: [
        expect.objectContaining({
          user_id: "user-1",
          label: "Main CV",
          tags: ["frontend"],
          storage_path: "user-1/object-id-my_cv_final_.pdf",
          size_bytes: 9,
          parsed_text: "CV text",
          parse_error: null,
        }),
      ],
    });
  });

  it("records the parse failure instead of rejecting the upload", async () => {
    extractCvText.mockRejectedValue(new Error("encrypted pdf"));
    const { context, ops } = contextWith({ tables: { cvs: { data: { id: CV_ID }, error: null } } });
    await callServerFn(uploadCv, { data: upload, context });

    expect(opsFor(ops, "cvs")).toContainEqual({
      name: "insert",
      args: [
        expect.objectContaining({
          parsed_text: null,
          parsed_at: null,
          parse_error: "encrypted pdf",
        }),
      ],
    });
  });

  it("returns a structured result when the plan CV limit is reached", async () => {
    enforceCvLimit.mockRejectedValue(new Error("CV_LIMIT_REACHED: up to 1 CV"));
    const { context, storage } = contextWith();
    await expect(callServerFn(uploadCv, { data: upload, context })).resolves.toEqual({
      limitReached: true,
      message: "CV_LIMIT_REACHED: up to 1 CV",
    });
    expect(storage.upload).not.toHaveBeenCalled();
  });

  it("rejects files over 5MB", async () => {
    const { context } = contextWith();
    const big = { ...upload, base64: Buffer.alloc(5 * 1024 * 1024 + 1).toString("base64") };
    await expect(callServerFn(uploadCv, { data: big, context })).rejects.toThrow(
      "File exceeds 5MB limit",
    );
  });

  it("surfaces storage upload errors", async () => {
    const { context } = contextWith({ storage: { upload: { error: { message: "no space" } } } });
    await expect(callServerFn(uploadCv, { data: upload, context })).rejects.toThrow("no space");
  });

  it("surfaces insert errors", async () => {
    const { context } = contextWith({ tables: { cvs: { error: { message: "nope" } } } });
    await expect(callServerFn(uploadCv, { data: upload, context })).rejects.toThrow("nope");
  });

  it("defaults tags to an empty list and rejects a blank label", () => {
    expect(validateInput(uploadCv, { ...upload, tags: undefined })).toMatchObject({ tags: [] });
    expect(() => validateInput(uploadCv, { ...upload, label: "" })).toThrow();
    expect(() => validateInput(uploadCv, { ...upload, base64: "" })).toThrow();
  });
});

describe("updateCv", () => {
  it("updates the label and tags", async () => {
    const { context, ops } = contextWith({ tables: { cvs: { error: null } } });
    await expect(
      callServerFn(updateCv, { data: { id: CV_ID, label: "New", tags: [] }, context }),
    ).resolves.toEqual({ ok: true });
    expect(opsFor(ops, "cvs")).toContainEqual({
      name: "update",
      args: [{ label: "New", tags: [] }],
    });
  });

  it("surfaces update errors", async () => {
    const { context } = contextWith({ tables: { cvs: { error: { message: "nope" } } } });
    await expect(
      callServerFn(updateCv, { data: { id: CV_ID, label: "New", tags: [] }, context }),
    ).rejects.toThrow("nope");
  });
});

describe("deleteCv", () => {
  it("removes the stored object before deleting the row", async () => {
    const { context, storage } = contextWith({
      tables: { cvs: [{ data: { storage_path: "user-1/cv.pdf" }, error: null }, { error: null }] },
    });
    await expect(callServerFn(deleteCv, { data: { id: CV_ID }, context })).resolves.toEqual({
      ok: true,
    });
    expect(storage.remove).toHaveBeenCalledWith(["user-1/cv.pdf"]);
  });

  it("skips storage when the row has no object", async () => {
    const { context, storage } = contextWith({
      tables: { cvs: [{ data: null, error: null }, { error: null }] },
    });
    await callServerFn(deleteCv, { data: { id: CV_ID }, context });
    expect(storage.remove).not.toHaveBeenCalled();
  });

  it("surfaces delete errors", async () => {
    const { context } = contextWith({
      tables: { cvs: [{ data: null, error: null }, { error: { message: "nope" } }] },
    });
    await expect(callServerFn(deleteCv, { data: { id: CV_ID }, context })).rejects.toThrow("nope");
  });
});

describe("downloadCv", () => {
  it("returns a signed URL and the original file name", async () => {
    const { context, storage } = contextWith({
      tables: {
        cvs: { data: { storage_path: "user-1/cv.pdf", file_name: "cv.pdf" }, error: null },
      },
      storage: { createSignedUrl: { data: { signedUrl: "https://signed" }, error: null } },
    });
    await expect(callServerFn(downloadCv, { data: { id: CV_ID }, context })).resolves.toEqual({
      url: "https://signed",
      fileName: "cv.pdf",
    });
    expect(storage.createSignedUrl).toHaveBeenCalledWith("user-1/cv.pdf", 300);
  });

  it("fails when the CV has no stored object", async () => {
    const { context } = contextWith({ tables: { cvs: { data: null, error: null } } });
    await expect(callServerFn(downloadCv, { data: { id: CV_ID }, context })).rejects.toThrow(
      "CV not found",
    );
  });

  it("surfaces signing errors", async () => {
    const { context } = contextWith({
      tables: { cvs: { data: { storage_path: "user-1/cv.pdf" }, error: null } },
      storage: { createSignedUrl: { data: null, error: { message: "expired key" } } },
    });
    await expect(callServerFn(downloadCv, { data: { id: CV_ID }, context })).rejects.toThrow(
      "expired key",
    );
  });
});
