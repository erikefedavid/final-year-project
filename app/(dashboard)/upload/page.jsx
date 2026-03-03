"use client";

import { useEffect } from "react";
import { UploadForm } from "@/components/forms/upload-form";

export default function UploadPage() {
  useEffect(() => {
    window.document.title = "Upload | DocDigitize";
  }, []);

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 overflow-x-hidden">
      <div className="max-w-xl mx-auto space-y-8">

        <div className="text-center sm:text-left">
          <h2 className="text-2xl sm:text-3xl font-bold break-words">
            Upload Document
          </h2>

          <p className="text-muted-foreground text-sm sm:text-base mt-2">
            Upload a scanned document to extract text and generate a summary.
          </p>
        </div>

        <div className="w-full">
          <UploadForm />
        </div>

      </div>
    </div>
  );
}