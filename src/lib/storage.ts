import { supabase } from "@/integrations/supabase/client";

export type BucketName = "course-media" | "tutor-cvs" | "assignments";

const MAX_BYTES = 15 * 1024 * 1024; // 15 MB

const ALLOWED: Record<BucketName, string[]> = {
  "course-media": ["image/jpeg", "image/png", "image/webp", "image/svg+xml", "application/pdf"],
  "tutor-cvs": [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ],
  assignments: [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "image/jpeg",
    "image/png",
    "text/plain",
    "application/zip",
  ],
};

function safeName(name: string) {
  const dot = name.lastIndexOf(".");
  const ext = dot > -1 ? name.slice(dot + 1).toLowerCase().replace(/[^a-z0-9]/g, "") : "bin";
  const base = (dot > -1 ? name.slice(0, dot) : name)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "file";
  return `${base}.${ext}`;
}

export function validateUpload(bucket: BucketName, file: File): string | null {
  if (file.size === 0) return "The selected file is empty.";
  if (file.size > MAX_BYTES) return "File is too large (15 MB maximum).";
  if (!ALLOWED[bucket].includes(file.type)) return "That file type is not allowed.";
  return null;
}

/**
 * Uploads a file to a Supabase Storage bucket and returns a usable URL.
 * Public buckets return a public URL; private buckets return a long-lived signed URL.
 */
export async function uploadFile(
  bucket: BucketName,
  file: File,
  opts: { prefix?: string; signed?: boolean } = {},
): Promise<{ path: string; url: string }> {
  const invalid = validateUpload(bucket, file);
  if (invalid) throw new Error(invalid);

  const prefix = (opts.prefix ?? "").replace(/^\/+|\/+$/g, "");
  const path = `${prefix ? `${prefix}/` : ""}${Date.now()}-${safeName(file.name)}`;

  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
    contentType: file.type,
  });
  if (error) throw error;

  if (opts.signed) {
    const { data, error: signErr } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, 60 * 60 * 24 * 365);
    if (signErr) throw signErr;
    return { path, url: data.signedUrl };
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return { path, url: data.publicUrl };
}
