import { l as createServerFn } from "./esm-9EjmF9OT.mjs";
import { t as requireSupabaseAuth } from "./auth-middleware-B3XILrvZ.mjs";
import { i as objectType, o as stringType, t as arrayType } from "../_libs/zod.mjs";
import { t as createServerRpc } from "./createServerRpc-TAUNrjZd.mjs";
import { n as logNonFatal } from "./errors-CRpvjv8q.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/cvs.functions-D9E5ojyv.js
var listCvs_createServerFn_handler = createServerRpc({
	id: "73e7acc5b4c3d342b60aaf211c488067ddb9df28965f66221baa7938ea3e3ce9",
	name: "listCvs",
	filename: "src/lib/cvs.functions.ts"
}, (opts) => listCvs.__executeServer(opts));
var listCvs = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(listCvs_createServerFn_handler, async ({ context }) => {
	const { data, error } = await context.supabase.from("cvs").select("id, label, tags, file_name, mime_type, size_bytes, parsed_at, parse_error, created_at").order("created_at", { ascending: false });
	if (error) throw new Error(error.message);
	return data ?? [];
});
var uploadSchema = objectType({
	label: stringType().min(1).max(120),
	tags: arrayType(stringType().max(40)).max(20).default([]),
	fileName: stringType().min(1).max(200),
	mimeType: stringType().min(1).max(120),
	base64: stringType().min(1)
});
var uploadCv_createServerFn_handler = createServerRpc({
	id: "21069aa8cf9eddfe4c6f569b2bb527f8abb191398604a6c5874d250675084395",
	name: "uploadCv",
	filename: "src/lib/cvs.functions.ts"
}, (opts) => uploadCv.__executeServer(opts));
var uploadCv = createServerFn({ method: "POST" }).validator((d) => uploadSchema.parse(d)).middleware([requireSupabaseAuth]).handler(uploadCv_createServerFn_handler, async ({ data, context }) => {
	const { enforceCvLimit, CvLimitReachedError } = await import("./usage.server-DuYUCagG.mjs");
	try {
		await enforceCvLimit(context.supabase, context.userId);
	} catch (e) {
		if (e instanceof CvLimitReachedError || e instanceof Error && e.message.startsWith("CV_LIMIT_REACHED")) return {
			limitReached: true,
			message: e.message
		};
		throw e;
	}
	const { extractCvText } = await import("./cv-parser.server-BlK_YrZp.mjs");
	const bytes = Buffer.from(data.base64, "base64");
	if (bytes.byteLength > 8 * 1024 * 1024) throw new Error("File exceeds 8MB limit");
	const objectId = crypto.randomUUID();
	const safeName = data.fileName.replace(/[^\w.\-]+/g, "_");
	const path = `${context.userId}/${objectId}-${safeName}`;
	const { error: upErr } = await context.supabase.storage.from("cvs").upload(path, bytes, {
		contentType: data.mimeType,
		upsert: false
	});
	if (upErr) throw new Error(upErr.message);
	let parsed_text = null;
	let parse_error = null;
	try {
		parsed_text = (await extractCvText(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength), data.mimeType, data.fileName)).slice(0, 2e5);
	} catch (e) {
		parse_error = e instanceof Error ? e.message : String(e);
	}
	const { data: row, error } = await context.supabase.from("cvs").insert({
		user_id: context.userId,
		label: data.label,
		tags: data.tags,
		storage_path: path,
		file_name: data.fileName,
		mime_type: data.mimeType,
		size_bytes: bytes.byteLength,
		parsed_text,
		parsed_at: parsed_text ? (/* @__PURE__ */ new Date()).toISOString() : null,
		parse_error
	}).select("id, label, tags, file_name, parsed_at, parse_error, created_at").single();
	if (error) {
		const { error: cleanupError } = await context.supabase.storage.from("cvs").remove([path]);
		if (cleanupError) logNonFatal("cvs.uploadCv.cleanup", cleanupError);
		throw new Error(error.message);
	}
	return row;
});
var deleteCv_createServerFn_handler = createServerRpc({
	id: "35233fa56c6aedd43ff6c3c8c71988cb90e6e799e3aa86bf7a18df683b4bf32a",
	name: "deleteCv",
	filename: "src/lib/cvs.functions.ts"
}, (opts) => deleteCv.__executeServer(opts));
var deleteCv = createServerFn({ method: "POST" }).validator((d) => objectType({ id: stringType().uuid() }).parse(d)).middleware([requireSupabaseAuth]).handler(deleteCv_createServerFn_handler, async ({ data, context }) => {
	const { data: cv, error: lookupError } = await context.supabase.from("cvs").select("storage_path").eq("id", data.id).maybeSingle();
	if (lookupError) throw new Error(lookupError.message);
	if (cv?.storage_path) {
		const { error: removeError } = await context.supabase.storage.from("cvs").remove([cv.storage_path]);
		if (removeError) throw new Error(`Could not delete stored file: ${removeError.message}`);
	}
	const { error } = await context.supabase.from("cvs").delete().eq("id", data.id);
	if (error) throw new Error(error.message);
	return { ok: true };
});
var updateSchema = objectType({
	id: stringType().uuid(),
	label: stringType().min(1).max(120),
	tags: arrayType(stringType().max(40)).max(20).default([])
});
var updateCv_createServerFn_handler = createServerRpc({
	id: "a1f1e1fb45c284056d4af0d8c66b6ea4b81c945d94c7996a5c625e62f430fd86",
	name: "updateCv",
	filename: "src/lib/cvs.functions.ts"
}, (opts) => updateCv.__executeServer(opts));
var updateCv = createServerFn({ method: "POST" }).validator((d) => updateSchema.parse(d)).middleware([requireSupabaseAuth]).handler(updateCv_createServerFn_handler, async ({ data, context }) => {
	const { error } = await context.supabase.from("cvs").update({
		label: data.label,
		tags: data.tags
	}).eq("id", data.id);
	if (error) throw new Error(error.message);
	return { ok: true };
});
var downloadCv_createServerFn_handler = createServerRpc({
	id: "9e7c54c89030709ae870530516cac2bb1753afd36b79dd656f3334435393a850",
	name: "downloadCv",
	filename: "src/lib/cvs.functions.ts"
}, (opts) => downloadCv.__executeServer(opts));
var downloadCv = createServerFn({ method: "POST" }).validator((d) => objectType({ id: stringType().uuid() }).parse(d)).middleware([requireSupabaseAuth]).handler(downloadCv_createServerFn_handler, async ({ data, context }) => {
	const { data: cv, error: lookupError } = await context.supabase.from("cvs").select("storage_path, file_name").eq("id", data.id).maybeSingle();
	if (lookupError) throw new Error(lookupError.message);
	if (!cv?.storage_path) throw new Error("CV not found");
	const { data: signed, error } = await context.supabase.storage.from("cvs").createSignedUrl(cv.storage_path, 300);
	if (error) throw new Error(error.message);
	if (!signed?.signedUrl) throw new Error("Could not create a download link for this CV");
	return {
		url: signed.signedUrl,
		fileName: cv.file_name
	};
});
//#endregion
export { deleteCv_createServerFn_handler, downloadCv_createServerFn_handler, listCvs_createServerFn_handler, updateCv_createServerFn_handler, uploadCv_createServerFn_handler };
