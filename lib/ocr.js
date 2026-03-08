export async function extractTextFromImage(imageBuffer) {
  try {
    const base64 = imageBuffer.toString("base64");

    const response = await fetch("https://api.ocr.space/parse/image", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        apikey: process.env.OCR_SPACE_API_KEY,
        base64Image: `data:image/jpeg;base64,${base64}`,
        language: "eng",
        isOverlayRequired: false,
        detectOrientation: true,
        scale: true,
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
