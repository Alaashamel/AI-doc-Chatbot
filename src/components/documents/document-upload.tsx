"use client";

import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  FileText,
  X,
  Check,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn, formatBytes } from "@/lib/utils";
import { MAX_FILE_SIZE_MB, ALLOWED_FILE_TYPES } from "@/config/constants";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface PendingFile {
  id: string;
  file: File;
  status: "pending" | "uploading" | "success" | "error";
  progress: number;
  error?: string;
}

const ACCEPTED_EXTENSIONS = new Set(ALLOWED_FILE_TYPES);
const MAX_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

function validateFile(file: File): string | null {
  const ext = "." + file.name.split(".").pop()?.toLowerCase();
  if (!ACCEPTED_EXTENSIONS.has(ext)) {
    return `File type "${ext}" is not supported. Allowed: ${ALLOWED_FILE_TYPES.join(", ")}`;
  }
  if (file.size > MAX_SIZE_BYTES) {
    return `File size (${formatBytes(file.size)}) exceeds the ${MAX_FILE_SIZE_MB}MB limit.`;
  }
  return null;
}

interface DocumentUploadProps {
  onUploadComplete?: () => void;
}

export function DocumentUpload({ onUploadComplete }: DocumentUploadProps) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);

  const addFiles = useCallback((fileList: FileList | File[]) => {
    const newFiles: PendingFile[] = [];
    for (const file of Array.from(fileList)) {
      const error = validateFile(file);
      newFiles.push({
        id: `file-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        file,
        status: error ? "error" : "pending",
        progress: 0,
        error: error ?? undefined,
      });
    }
    setPendingFiles((prev) => [...prev, ...newFiles]);
  }, []);

  const removeFile = useCallback((id: string) => {
    setPendingFiles((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/documents/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "Upload failed");
      }

      return res.json();
    },
  });

  const handleUploadAll = useCallback(async () => {
    const filesToUpload = pendingFiles.filter(
      (f) => f.status === "pending"
    );
    if (filesToUpload.length === 0) return;

    for (const pending of filesToUpload) {
      setPendingFiles((prev) =>
        prev.map((f) =>
          f.id === pending.id ? { ...f, status: "uploading" as const, progress: 50 } : f
        )
      );

      try {
        await uploadMutation.mutateAsync(pending.file);
        setPendingFiles((prev) =>
          prev.map((f) =>
            f.id === pending.id
              ? { ...f, status: "success" as const, progress: 100 }
              : f
          )
        );
        toast.success(`Uploaded ${pending.file.name}`);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Upload failed";
        setPendingFiles((prev) =>
          prev.map((f) =>
            f.id === pending.id
              ? { ...f, status: "error" as const, error: message }
              : f
          )
        );
        toast.error(`Failed to upload ${pending.file.name}: ${message}`);
      }
    }

    queryClient.invalidateQueries({ queryKey: ["documents"] });
    onUploadComplete?.();

    setTimeout(() => {
      setPendingFiles((prev) => prev.filter((f) => f.status !== "success"));
    }, 3000);
  }, [pendingFiles, uploadMutation, queryClient, onUploadComplete]);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      if (e.dataTransfer.files.length > 0) {
        addFiles(e.dataTransfer.files);
      }
    },
    [addFiles]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const pendingCount = pendingFiles.filter((f) => f.status === "pending").length;
  const hasFiles = pendingFiles.length > 0;

  return (
    <div className="space-y-4">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-all",
          isDragOver
            ? "border-primary bg-primary/5 scale-[1.01]"
            : "border-muted-foreground/25 hover:border-muted-foreground/50 hover:bg-muted/20"
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          multiple
          accept={ALLOWED_FILE_TYPES.join(",")}
          onChange={(e) => {
            if (e.target.files) addFiles(e.target.files);
            e.target.value = "";
          }}
        />

        <div
          className={cn(
            "mb-3 flex h-12 w-12 items-center justify-center rounded-full transition-colors",
            isDragOver ? "bg-primary/15" : "bg-muted"
          )}
        >
          <Upload
            className={cn(
              "h-6 w-6 transition-colors",
              isDragOver ? "text-primary" : "text-muted-foreground"
            )}
          />
        </div>

        <p className="text-sm font-medium">
          {isDragOver ? "Drop files here" : "Click to upload or drag and drop"}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          {ALLOWED_FILE_TYPES.join(", ").toUpperCase()} — Max {MAX_FILE_SIZE_MB}MB
        </p>
      </div>

      <AnimatePresence>
        {hasFiles && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="space-y-2">
              {pendingFiles.map((pf) => (
                <motion.div
                  key={pf.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 8 }}
                  className="flex items-center gap-3 rounded-lg border bg-card p-3"
                >
                  <FileText className="h-5 w-5 shrink-0 text-muted-foreground" />

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{pf.file.name}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{formatBytes(pf.file.size)}</span>
                      <span>•</span>
                      <span className="uppercase">
                        {pf.file.name.split(".").pop()}
                      </span>
                    </div>
                    {pf.status === "uploading" && (
                      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
                        <motion.div
                          className="h-full bg-primary"
                          initial={{ width: 0 }}
                          animate={{ width: `${pf.progress}%` }}
                        />
                      </div>
                    )}
                    {pf.error && (
                      <p className="mt-1 text-xs text-destructive">
                        {pf.error}
                      </p>
                    )}
                  </div>

                  <div className="shrink-0">
                    {pf.status === "success" ? (
                      <Check className="h-5 w-5 text-green-500" />
                    ) : pf.status === "error" ? (
                      <AlertCircle className="h-5 w-5 text-destructive" />
                    ) : pf.status === "uploading" ? (
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    ) : (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFile(pf.id);
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="mt-3 flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPendingFiles([])}
                className="text-xs"
              >
                Clear all
              </Button>
              <Button
                size="sm"
                onClick={handleUploadAll}
                disabled={pendingCount === 0}
                className="gap-1.5"
              >
                <Upload className="h-3.5 w-3.5" />
                Upload{pendingCount > 0 ? ` (${pendingCount})` : ""}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
