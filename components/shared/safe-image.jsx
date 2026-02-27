"use client";

import { useState } from "react";
import { FileText } from "lucide-react";

export function SafeImage({ src, alt, className = "" }) {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  if (hasError || !src) {
    return (
      <div className={`flex flex-col items-center justify-center bg-muted rounded-lg p-8 ${className}`}>
        <FileText className="h-12 w-12 text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground">Image unavailable</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {isLoading && (
        <div className={`flex items-center justify-center bg-muted rounded-lg animate-pulse ${className}`}>
          <p className="text-sm text-muted-foreground">Loading image...</p>
        </div>
      )}
      <img
        src={src}
        alt={alt}
        className={`${className} ${isLoading ? "hidden" : ""}`}
        onError={() => setHasError(true)}
        onLoad={() => setIsLoading(false)}
      />
    </div>
  );
}