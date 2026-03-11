export async function extractTextFromPDF(fileBuffer) {
  // 1. Input validation
  if (!fileBuffer || fileBuffer.length === 0) {
    throw new Error("No PDF file provided or file is empty.");
  }

  const { getDocumentProxy } = await import("unpdf");

  let pdf;
  try {
    pdf = await getDocumentProxy(new Uint8Array(fileBuffer));
  } catch (e) {
    throw new Error(
      "Could not open PDF. The file may be password-protected, corrupted, or not a valid PDF."
    );
  }

  try {
    if (!pdf.numPages || pdf.numPages === 0) {
      throw new Error("PDF has no pages.");
    }

    let fullText = "";
    const errors = [];
    let isLikelyScanned = false;

    for (let i = 1; i <= pdf.numPages; i++) {
      try {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        
        // Improved text mapping: respects newlines better than just spaces
        const pageText = textContent.items
          .map((item) => item.str)
          .join(" "); // Note: for strict paragraph breaks, more complex math based on item.transform is required

        fullText += pageText.trim() + "\n\n";
      } catch (pageError) {
        console.warn(`Failed to extract text from page ${i}:`, pageError);
        errors.push(i);
      }
    }

    const trimmed = fullText.trim();

    // Scanned-PDF detection
    if (!trimmed) {
      throw new Error(
        "No text could be extracted. This is likely a scanned document or image-based PDF. Please upload a digitally-created PDF."
      );
    }

    // Warn (but DO NOT throw) if text is suspiciously short
    if (trimmed.length < 20) {
      isLikelyScanned = true;
    }

    return {
      text: trimmed,
      pages: pdf.numPages,
      // Pass warnings back to the frontend instead of crashing
      ...(isLikelyScanned && { 
        notice: "Very little text was extracted. If this document has more text visually, it may be an image-based scan." 
      }),
      ...(errors.length > 0 && {
        warning: `Could not extract text from page(s): ${errors.join(", ")}`,
      }),
    };
  } finally {
    // 2. Always clean up resources to prevent memory leaks
    try {
      // Use destroy() as it's the standard for pdf.js proxies
      if (typeof pdf.destroy === 'function') {
        await pdf.destroy();
      } else if (typeof pdf.cleanup === 'function') {
        await pdf.cleanup();
      }
    } catch {
      // ignore cleanup errors
    }
  }
    }
