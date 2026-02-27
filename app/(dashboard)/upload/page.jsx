"use client";

import { useEffect } from "react";
import { UploadForm } from "@/components/forms/upload-form";

export default function UploadPage() {
  useEffect(() => {
    window.document.title = "Upload | DocDigitize";
  }, []);

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Upload Document</h2>
        <p className="text-muted-foreground">
          Upload a scanned document to extract text and generate a summary.
        </p>
      </div>

      <UploadForm />
    </div>
  );
}