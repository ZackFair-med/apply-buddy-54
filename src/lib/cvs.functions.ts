import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { logNonFatal } from "./errors";

export const listCvs = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("cvs")
      .select("id, label, tags, file_name, mime_type, size_bytes, parsed_at, parse_error, created_at")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

const uploadSchema = z.object({
  label: z.string().min(1).max(120),
  tags: z.array(z.string().max(40)).max(20).default([]),
  fileName: z.string().min(1).max(200),
  mimeType: z.string().min(1).max(120),
  base64: z.string().min(1), // base64-encoded file bytes
});

export const uploadCv = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => uploadSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { enforceCvLimit, CvLimitReachedError } = await import("./usage.server");
    try {
      await enforceCvLimit(context.supabase, context.userId);
    } catch (e) {
      // Only a real limit becomes a structured result the client can toast cleanly;
      // anything else (e.g. the plan/count query failing) must still surface as an error.
      if (!(e instanceof CvLimitReachedError)) throw e;
      return { limitReached: true as const, message: e.message };
    }
    const { extractCvText } = await import("./cv-parser.server");
    const bytes = Buffer.from(data.base64, "base64");
    if (bytes.byteLength > 8 * 1024 * 1024) throw new Error("File exceeds 8MB limit");




    // Upload to storage under userId/uuid-filename
    const objectId = crypto.randomUUID();
    const safeName = data.fileName.replace(/[^\w.\-]+/g, "_");
    const path = `${context.userId}/${objectId}-${safeName}`;
    const { error: upErr } = await context.supabase.storage
      .from("cvs")
      .upload(path, bytes, { contentType: data.mimeType, upsert: false });
    if (upErr) throw new Error(upErr.message);

    // Parse text once
    let parsed_text: string | null = null;
    let parse_error: string | null = null;
    try {
      parsed_text = (await extractCvText(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength), data.mimeType, data.fileName)).slice(0, 200000);
    } catch (e) {
      parse_error = e instanceof Error ? e.message : String(e);
    }

    const { data: row, error } = await context.supabase
      .from("cvs")
      .insert({
        user_id: context.userId,
        label: data.label,
        tags: data.tags,
        storage_path: path,
        file_name: data.fileName,
        mime_type: data.mimeType,
        size_bytes: bytes.byteLength,
        parsed_text,
        parsed_at: parsed_text ? new Date().toISOString() : null,
        parse_error,
      })
      .select("id, label, tags, file_name, parsed_at, parse_error, created_at")
      .single();
    if (error) {
      // Do not leave the uploaded object orphaned in storage.
      const { error: cleanupError } = await context.supabase.storage.from("cvs").remove([path]);
      if (cleanupError) logNonFatal("cvs.uploadCv.cleanup", cleanupError);
      throw new Error(error.message);
    }
    return row;
  });

export const deleteCv = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: cv, error: lookupError } = await context.supabase
      .from("cvs")
      .select("storage_path")
      .eq("id", data.id)
      .maybeSingle();
    if (lookupError) throw new Error(lookupError.message);
    if (cv?.storage_path) {
      const { error: removeError } = await context.supabase.storage
        .from("cvs")
        .remove([cv.storage_path]);
      if (removeError) throw new Error(`Could not delete stored file: ${removeError.message}`);
    }
    const { error } = await context.supabase.from("cvs").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

const updateSchema = z.object({
  id: z.string().uuid(),
  label: z.string().min(1).max(120),
  tags: z.array(z.string().max(40)).max(20).default([]),
});

export const updateCv = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => updateSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("cvs")
      .update({ label: data.label, tags: data.tags })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const downloadCv = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: cv, error: lookupError } = await context.supabase
      .from("cvs")
      .select("storage_path, file_name")
      .eq("id", data.id)
      .maybeSingle();
    if (lookupError) throw new Error(lookupError.message);
    if (!cv?.storage_path) throw new Error("CV not found");

    const { data: signed, error } = await context.supabase.storage
      .from("cvs")
      .createSignedUrl(cv.storage_path, 300);
    if (error) throw new Error(error.message);
    if (!signed?.signedUrl) throw new Error("Could not create a download link for this CV");

    return { url: signed.signedUrl, fileName: cv.file_name };
  });
