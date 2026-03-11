"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Upload,
  X,
  FileText,
  AlertCircle,
  Loader2,
  FolderOpen,
} from "lucide-react";
import { MAX_FILE_SIZE, ALLOWED_FILE_TYPES } from "@/lib/constants";
import { toast } from "sonner";
import { fetchWithTimeout } from "@/lib/fetch-wrapper";
import { cn } from "@/lib/utils";

export function UploadForm() {
  const [file, setFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef(null);
  const router = useRouter();

  const validateFile = (selectedFile) => {
    if (!ALLOWED_FILE_TYPES.includes(selectedFile.type)) {
      setError("Invalid file type. Please upload JPG, PNG, PDF, or DOCX.");
      return false;
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      setError("File too large. Maximum size is 10MB.");
      toast.error("File too large. Maximum size is 10MB.");
      return false;
    }

    return true;
  };

  const handleFileSelect = (selectedFile) => {
    setError("");
    if (!selectedFile) return;
    if (validateFile(selectedFile)) {
      setFile(selectedFile);
    }
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    handleFileSelect(droppedFile);
  };

  const handleInputChange = (e) => {
    const selectedFile = e.target.files[0];
    handleFileSelect(selectedFile);
  };

  const handleRemoveFile = () => {
    setFile(null);
    setError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const handleSubmit = async () => {
    if (!file) return;

    setIsProcessing(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetchWithTimeout(
        "/api/documents",
        { method: "POST", body: formData },
        60000
      );

      const data = await response.json();

      if (data.success) {
        toast.success("Document processed successfully!");
        const docId = data.data.document._id;
        setTimeout(() => {
          router.push(`/document/${docId}`);
        }, 500);
      } else {
        const errorMessage = data.error || "Failed to process document.";

        if (errorMessage.includes("already been uploaded")) {
          toast.error("This document has already been uploaded.");
        } else if (
          errorMessage.includes("scanned") ||
          errorMessage.includes("image-based")
        ) {
          toast.error(
            "This PDF appears to be scanned. Please upload a digitally-created PDF."
          );
        } else if (
          errorMessage.includes("password") ||
          errorMessage.includes("corrupted")
        ) {
          toast.error(
            "Could not open PDF. It may be password protected or corrupted."
          );
        } else if (errorMessage.includes("Too many uploads")) {
          toast.error(
            "Too many uploads. Please wait a minute before trying again."
          );
        } else if (errorMessage.includes("too large")) {
          toast.error("File too large. Maximum size is 10MB.");
        } else {
          toast.error(errorMessage);
        }

        setError(errorMessage);
      }
    } catch (err) {
      if (err.name === "AbortError" || err.message?.includes("timeout")) {
        toast.error(
          "Request timed out. Your file may be too large or complex."
        );
        setError("Request timed out. Please try a smaller file.");
      } else {
        toast.error("Something went wrong. Please try again.");
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-4">
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept=".jpg,.jpeg,.png,.pdf,.docx"
        onChange={handleInputChange}
      />

      {/* Supported formats notice */}
      <Card className="border border-yellow-500/30 bg-yellow-500/5">
        <CardContent className="py-3 px-4">
          <div className="flex gap-2">
            <AlertCircle className="h-4 w-4 text-yellow-500 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-xs font-medium text-yellow-500">
                Before you upload
              </p>
              <ul className="text-xs text-muted-foreground space-y-0.5">
                <li>• Supported: Digital PDFs, Word docs (.docx), JPEG, PNG</li>
                <li>• Screenshots and phone photos are supported</li>
                <li>• Handwriting is not supported</li>
                <li>• Scanned PDFs are not supported</li>
                <li>• Password protected PDFs will fail</li>
                <li>• Maximum file size is 10MB</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {!file ? (
        <>
          {/* Desktop drag and drop */}
          <Card
            className={cn(
              "border-2 border-dashed cursor-pointer transition-all duration-200 hidden md:block",
              isDragging
                ? "border-primary bg-primary/5 scale-[1.02]"
                : "border-muted-foreground/25 hover:border-primary/50"
            )}
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <CardContent className="flex flex-col items-center justify-center py-12">
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Upload className="h-10 w-10 text-muted-foreground mb-4" />
              </motion.div>
              <p className="text-lg font-medium mb-1">
                Drag and drop your file here
              </p>
              <p className="text-sm text-muted-foreground mb-2">
                or click to browse
              </p>
              <p className="text-xs text-muted-foreground">
                JPG, PNG, PDF, DOCX — Max 10MB
              </p>
            </CardContent>
          </Card>

          {/* Mobile browse only */}
          <div className="md:hidden">
            <motion.div whileTap={{ scale: 0.98 }}>
              <Card
                className="border-2 border-dashed cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <CardContent className="flex items-center gap-4 py-6">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
                    <FolderOpen className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Browse Files</p>
                    <p className="text-sm text-muted-foreground">
                      JPG, PNG, PDF, DOCX — Max 10MB
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="overflow-hidden">
            <CardContent className="flex items-center gap-3 py-4 min-w-0">
              <FileText className="h-8 w-8 text-primary shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="font-medium text-sm truncate">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(file.size)}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0"
                onClick={handleRemoveFile}
                disabled={isProcessing}
              >
                <X className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {error && (
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2 text-sm text-red-500"
        >
          <AlertCircle className="h-4 w-4" />
          <p>{error}</p>
        </motion.div>
      )}

      <Button
        className="w-full"
        size="lg"
        onClick={handleSubmit}
        disabled={!file || isProcessing}
      >
        {isProcessing ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <Upload className="h-4 w-4 mr-2" />
            Process Document
          </>
        )}
      </Button>
    </div>
  );
         }
