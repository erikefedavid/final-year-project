import mammoth from "mammoth";

export async function extractTextFromDocx(fileBuffer) {
  try {
    const result = await mammoth.extractRawText({
      buffer: fileBuffer,
    });

    return {
      text: result.value,
    };
  } catch (error) {
    console.error("DOCX parsing failed:", error);
    throw new Error("Failed to extract text from DOCX");
  }
}