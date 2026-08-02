import { afterEach, describe, expect, it, vi } from "vitest";
import { extractCvText } from "./cv-parser.server";

const extractText = vi.fn();
const getDocumentProxy = vi.fn();
const extractRawText = vi.fn();

vi.mock("unpdf", () => ({
  extractText: (...args: unknown[]) => extractText(...args),
  getDocumentProxy: (...args: unknown[]) => getDocumentProxy(...args),
}));

vi.mock("mammoth", () => ({
  default: { extractRawText: (...args: unknown[]) => extractRawText(...args) },
  extractRawText: (...args: unknown[]) => extractRawText(...args),
}));

const DOCX_MIME = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
const buffer = new TextEncoder().encode("file-bytes").buffer;

afterEach(() => {
  vi.clearAllMocks();
});

describe("extractCvText", () => {
  it("joins multi-page PDF text", async () => {
    getDocumentProxy.mockResolvedValue("pdf-proxy");
    extractText.mockResolvedValue({ text: ["page one", "page two"] });

    await expect(extractCvText(buffer, "application/pdf", "cv.bin")).resolves.toBe(
      "page one\npage two",
    );
    expect(getDocumentProxy).toHaveBeenCalledWith(expect.any(Uint8Array));
    expect(extractText).toHaveBeenCalledWith("pdf-proxy", { mergePages: true });
  });

  it("stringifies already-merged PDF text", async () => {
    getDocumentProxy.mockResolvedValue("pdf-proxy");
    extractText.mockResolvedValue({ text: "one page" });

    await expect(extractCvText(buffer, "application/pdf", "cv.pdf")).resolves.toBe("one page");
  });

  it("detects a PDF by extension when the mime type is generic", async () => {
    getDocumentProxy.mockResolvedValue("pdf-proxy");
    extractText.mockResolvedValue({ text: "from extension" });

    await expect(extractCvText(buffer, "application/octet-stream", "Resume.PDF")).resolves.toBe(
      "from extension",
    );
  });

  it("extracts raw text from a DOCX", async () => {
    extractRawText.mockResolvedValue({ value: "docx text" });

    await expect(extractCvText(buffer, DOCX_MIME, "cv.bin")).resolves.toBe("docx text");
    expect(extractRawText).toHaveBeenCalledWith({ buffer: expect.any(Buffer) });
  });

  it("detects a DOCX by extension", async () => {
    extractRawText.mockResolvedValue({ value: "docx text" });

    await expect(extractCvText(buffer, "", "Resume.DOCX")).resolves.toBe("docx text");
  });

  it("rejects unsupported types, naming the mime type", async () => {
    await expect(extractCvText(buffer, "text/plain", "cv.txt")).rejects.toThrow(
      "Unsupported file type: text/plain",
    );
  });

  it("falls back to the file name when there is no mime type", async () => {
    await expect(extractCvText(buffer, "", "cv.txt")).rejects.toThrow(
      "Unsupported file type: cv.txt",
    );
  });
});
