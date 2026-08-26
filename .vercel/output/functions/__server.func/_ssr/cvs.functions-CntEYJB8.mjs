import { l as createServerFn } from "./esm-9EjmF9OT.mjs";
import { t as createSsrRpc } from "./createSsrRpc-C19MdsU6.mjs";
import { t as requireSupabaseAuth } from "./auth-middleware-B3XILrvZ.mjs";
import { i as objectType, o as stringType, t as arrayType } from "../_libs/zod.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/cvs.functions-CntEYJB8.js
var listCvs = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(createSsrRpc("73e7acc5b4c3d342b60aaf211c488067ddb9df28965f66221baa7938ea3e3ce9"));
var uploadSchema = objectType({
	label: stringType().min(1).max(120),
	tags: arrayType(stringType().max(40)).max(20).default([]),
	fileName: stringType().min(1).max(200),
	mimeType: stringType().min(1).max(120),
	base64: stringType().min(1)
});
var uploadCv = createServerFn({ method: "POST" }).validator((d) => uploadSchema.parse(d)).middleware([requireSupabaseAuth]).handler(createSsrRpc("21069aa8cf9eddfe4c6f569b2bb527f8abb191398604a6c5874d250675084395"));
var deleteCv = createServerFn({ method: "POST" }).validator((d) => objectType({ id: stringType().uuid() }).parse(d)).middleware([requireSupabaseAuth]).handler(createSsrRpc("35233fa56c6aedd43ff6c3c8c71988cb90e6e799e3aa86bf7a18df683b4bf32a"));
var updateSchema = objectType({
	id: stringType().uuid(),
	label: stringType().min(1).max(120),
	tags: arrayType(stringType().max(40)).max(20).default([])
});
var updateCv = createServerFn({ method: "POST" }).validator((d) => updateSchema.parse(d)).middleware([requireSupabaseAuth]).handler(createSsrRpc("a1f1e1fb45c284056d4af0d8c66b6ea4b81c945d94c7996a5c625e62f430fd86"));
var downloadCv = createServerFn({ method: "POST" }).validator((d) => objectType({ id: stringType().uuid() }).parse(d)).middleware([requireSupabaseAuth]).handler(createSsrRpc("9e7c54c89030709ae870530516cac2bb1753afd36b79dd656f3334435393a850"));
//#endregion
export { uploadCv as a, updateCv as i, downloadCv as n, listCvs as r, deleteCv as t };
