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

    for (let i = 1; i <= pdf.numPages; i++) {
      try {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .filter((item) => item.str && item.str.trim()) // filter empty items
          .map((item) => item.str)
          .join(" ");
        fullText += pageText + "\n\n";
      } catch (pageError) {
        console.warn(`Failed to extract text from page ${i}:`, pageError);
        errors.push(i);
        // Continue with other pages instead of failing entirely
      }
    }

    const trimmed = fullText.trim();

    // More nuanced scanned-PDF detection
    if (!trimmed) {
      throw new Error(
        "No text could be extracted from this PDF. It may be a scanned document or image-based PDF. Please upload a digitally-created PDF."
      );
    }

    // Warn but don't reject short text — could be a legitimate short doc
    if (trimmed.length < 20) {
      throw new Error(
        "Very little text was extracted. This PDF may be scanned or image-based. Please upload a digitally-created PDF."
      );
    }

    return {
      text: trimmed,
      pages: pdf.numPages,
      ...(errors.length > 0 && {
        warning: `Could not extract text from page(s): ${errors.join(", ")}`,
      }),
    };
  } finally {
    // 2. Always clean up resources
    try {
      await pdf.cleanup?.();
    } catch {
      // ignore cleanup errors
    }
  }
}
