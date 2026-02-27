"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, X, FileText, AlertCircle, Loader2, Camera, FolderOpen } from "lucide-react";
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
  const cameraInputRef = useRef(null);
  const router = useRouter();

  const validateFile = (selectedFile) => {
    if (!ALLOWED_FILE_TYPES.includes(selectedFile.type)) {
      setError("Invalid file type. Please upload JPG, PNG, PDF, or DOCX.");
      return false;
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      setError("File too large. Maximum size is 10MB.");
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
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    if (cameraInputRef.current) {
      cameraInputRef.current.value = "";
    }
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
      
      const response = await fetchWithTimeout("/api/documents", {
        method: "POST",
        body: formData,
      }, 60000);

      const data = await response.json();

      if (data.success) {
        toast.success("Document processed successfully!");
        const docId = data.data.document._id;
        setTimeout(() => {
          router.push(`/document/${docId}`);
        }, 500);
      } else {
        toast.error(data.error || "Failed to process document.");
        setError(data.error || "Failed to process document.");
      }
    } catch (err) {
      toast.error("Something went wrong. Please try again.");
      setError("Something went wrong. Please try again.");
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

      <input
        type="file"
        ref={cameraInputRef}
        className="hidden"
        accept="image/*"
        capture="environment"
        onChange={handleInputChange}
      />

      {!file ? (
        <>
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

          <div className="md:hidden space-y-3">
            <motion.div
              whileTap={{ scale: 0.98 }}
            >
              <Card
                className="border-2 border-dashed cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => cameraInputRef.current?.click()}
              >
                <CardContent className="flex items-center gap-4 py-6">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
                    <Camera className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Take a Photo</p>
                    <p className="text-sm text-muted-foreground">
                      Use your camera to scan a document
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              whileTap={{ scale: 0.98 }}
            >
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
                      Select from your device — JPG, PNG, PDF, DOCX
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
          <Card>
            <CardContent className="flex items-center justify-between py-4">
              <div className="flex items-center gap-3">
                <FileText className="h-8 w-8 text-primary" />
                <div>
                  <p className="font-medium text-sm">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(file.size)}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
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