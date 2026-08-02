import { o as __toESM } from "../_runtime.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/cv-parser.server-BlK_YrZp.js
async function extractCvText(buffer, mimeType, fileName) {
	const isPdf = mimeType === "application/pdf" || fileName.toLowerCase().endsWith(".pdf");
	const isDocx = mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || fileName.toLowerCase().endsWith(".docx");
	if (isPdf) {
		const { extractText, getDocumentProxy } = await import("../_libs/unpdf.mjs").then((n) => n.t);
		const { text } = await extractText(await getDocumentProxy(new Uint8Array(buffer)), { mergePages: true });
		return Array.isArray(text) ? text.join("\n") : String(text);
	}
	if (isDocx) return (await (await import("../_libs/mammoth+[...].mjs").then((n) => /* @__PURE__ */ __toESM(n.t()))).extractRawText({ buffer: Buffer.from(buffer) })).value;
	throw new Error(`Unsupported file type: ${mimeType || fileName}`);
}
//#endregion
export { extractCvText };
