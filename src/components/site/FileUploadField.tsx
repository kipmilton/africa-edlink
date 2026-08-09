import { useRef, useState } from "react";
import { Loader2, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { uploadFile, type BucketName } from "@/lib/storage";
import { cn } from "@/lib/utils";

type Props = {
  label: string;
  bucket: BucketName;
  value: string;
  onChange: (url: string) => void;
  prefix?: string;
  signed?: boolean;
  accept?: string;
  preview?: boolean;
  hint?: string;
  className?: string;
};

export function FileUploadField({
  label,
  bucket,
  value,
  onChange,
  prefix,
  signed,
  accept = "image/*,application/pdf",
  preview = true,
  hint,
  className,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setBusy(true);
    try {
      const { url } = await uploadFile(bucket, file, { prefix, signed });
      onChange(url);
      toast.success("File uploaded");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className={cn("grid gap-2", className)}>
      <Label>{label}</Label>
      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" variant="outline" disabled={busy} onClick={() => inputRef.current?.click()}>
          {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
          {busy ? "Uploading…" : value ? "Replace file" : "Choose file"}
        </Button>
        {value ? (
          <Button type="button" variant="ghost" size="sm" onClick={() => onChange("")}>
            <X className="mr-1 h-4 w-4" /> Remove
          </Button>
        ) : null}
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => void handleFile(e.target.files?.[0])}
        />
      </div>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="…or paste a URL"
        className="text-xs"
      />
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
      {preview && value ? (
        <img src={value} alt="" className="h-32 w-full rounded-md border object-cover" />
      ) : null}
    </div>
  );
}
