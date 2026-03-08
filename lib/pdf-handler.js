export async function extractTextFromPDF(fileBuffer) {
  try {
    const { getDocumentProxy } = await import("unpdf");

    let pdf;
    try {
      pdf = await getDocumentProxy(new Uint8Array(fileBuffer));
    } catch (e) {
      throw new Error(
        "Could not open PDF. The file may be password protected or corrupted."
      );
    }

    let fullText = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item) => item.str).join(" ");
      fullText += pageText + "\n\n";
    }

    const trimmed = fullText.trim();

    if (!trimmed || trimmed.length < 50) {
      throw new Error(
        "This appears to be a scanned PDF. Scanned PDFs are not supported. Please upload a digital PDF."
      );
    }

    return { text: trimmed, pages: pdf.numPages };
  } catch (error) {
    console.error("PDF parsing failed:", error);
    throw new Error(error.message || "Failed to extract text from PDF");
  }
}
