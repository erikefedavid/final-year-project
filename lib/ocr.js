import sharp from "sharp";

export async function extractTextFromImage(imageBuffer) {
  try {
    // Detect image type using sharp
    const metadata = await sharp(imageBuffer).metadata();
    const mimeType = `image/${metadata.format}`;

    const base64 = imageBuffer.toString("base64");

    const response = await fetch("https://api.ocr.space/parse/image", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        apikey: process.env.OCR_SPACE_API_KEY,
        base64Image: `data:${mimeType};base64,${base64}`,
        language: "eng",
        isOverlayRequired: false,
      }),
    });

    const result = await response.json();

    if (result.IsErroredOnProcessing) {
      throw new Error(result.ErrorMessage?.[0] || "OCR processing failed");
    }

    const text = result.ParsedResults?.[0]?.ParsedText;

    if (!text) {
      throw new Error("No text extracted from image");
    }

    return {
      text: text,
      confidence: 99,
    };
  } catch (error) {
    console.error("OCR failed:", error);
    throw new Error("Failed to extract text from image");
  }
}
