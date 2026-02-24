export async function extractTextFromPDF(fileBuffer) {
  try {
    const { getDocumentProxy } = await import("unpdf");

    const pdf = await getDocumentProxy(new Uint8Array(fileBuffer));

    let fullText = "";

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item) => item.str)
        .join(" ");
      fullText += pageText + "\n\n";
    }

    return {
      text: fullText.trim(),
      pages: pdf.numPages,
    };
  } catch (error) {
    console.error("PDF parsing failed:", error);
    throw new Error("Failed to extract text from PDF");
  }
}