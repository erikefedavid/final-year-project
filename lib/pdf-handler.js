export async function extractTextFromPDF(fileBuffer) {
  try {
    // First try normal text extraction
    const { getDocumentProxy } = await import("unpdf");
    const pdf = await getDocumentProxy(new Uint8Array(fileBuffer));

    let fullText = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item) => item.str).join(" ");
      fullText += pageText + "\n\n";
    }

    const trimmed = fullText.trim();

    // If no text found, it's probably a scanned PDF — use OCR
    if (!trimmed || trimmed.length < 50) {
      console.log("No text layer found, falling back to OCR...");
      return await extractScannedPDF(fileBuffer);
    }

    return { text: trimmed, pages: pdf.numPages };
  } catch (error) {
    console.error("PDF parsing failed:", error);
    throw new Error("Failed to extract text from PDF");
  }
}

async function extractScannedPDF(fileBuffer) {
  const base64 = Buffer.from(fileBuffer).toString("base64");

  const response = await fetch("https://api.ocr.space/parse/image", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      apikey: process.env.OCR_SPACE_API_KEY,
      base64Image: `data:application/pdf;base64,${base64}`,
      language: "eng",
      isOverlayRequired: false,
      filetype: "PDF",
    }),
  });

  const result = await response.json();

  if (result.IsErroredOnProcessing) {
    throw new Error(result.ErrorMessage?.[0] || "OCR failed on scanned PDF");
  }

  const text = result.ParsedResults?.map((r) => r.ParsedText).join("\n\n");

  return { text: text || "", pages: result.ParsedResults?.length || 1 };
}
