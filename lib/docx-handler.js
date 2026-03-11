import mammoth from "mammoth";

export async function extractTextFromDocx(fileBuffer) {
  // 1. Input validation
  if (!fileBuffer || fileBuffer.length === 0) {
    throw new Error("No DOCX file provided or file is empty.");
  }

  // 2. Ensure we have a proper Buffer
  const buffer = Buffer.isBuffer(fileBuffer)
    ? fileBuffer
    : Buffer.from(fileBuffer);

  let result;
  try {
    result = await mammoth.extractRawText({ buffer });
  } catch (error) {
    console.error("DOCX parsing failed:", error);
    throw new Error(
      "Could not read DOCX file. The file may be corrupted or not a valid DOCX document."
    );
  }

  // 3. Log any mammoth warnings
  if (result.messages && result.messages.length > 0) {
    console.warn(
      "DOCX extraction warnings:",
      result.messages.map((m) => m.message)
    );
  }

  // 4. Validate extracted text
  const trimmed = result.value?.trim() || "";

  if (!trimmed) {
    throw new Error(
      "No text could be extracted from this DOCX. The document may be empty or contain only images."
    );
  }

  return {
    text: trimmed,
    ...(result.messages?.length > 0 && {
      warnings: result.messages.map((m) => m.message),
    }),
  };
}
