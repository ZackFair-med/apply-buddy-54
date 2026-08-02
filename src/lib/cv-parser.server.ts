// Server-only CV text extraction.
// Runs in the Cloudflare Worker runtime — uses unpdf (Worker-safe) and mammoth.

export async function extractCvText(
  buffer: ArrayBuffer,
  mimeType: string,
  fileName: string,
): Promise<string> {
  const isPdf = mimeType === "application/pdf" || fileName.toLowerCase().endsWith(".pdf");
  const isDocx =
    mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    fileName.toLowerCase().endsWith(".docx");

  if (isPdf) {
    const { extractText, getDocumentProxy } = await import("unpdf");
    const pdf = await getDocumentProxy(new Uint8Array(buffer));
    const { text } = await extractText(pdf, { mergePages: true });
    return Array.isArray(text) ? (text as string[]).join("\n") : String(text);
  }

  if (isDocx) {
    const mammoth = await import("mammoth");
    // mammoth expects Node Buffer; polyfill via Uint8Array wrapper.
    const result = await mammoth.extractRawText({ buffer: Buffer.from(buffer) });
    return result.value;
  }

  throw new Error(`Unsupported file type: ${mimeType || fileName}`);
}
