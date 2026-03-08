export async function extractTextFromImage(imageBuffer) {
  try {
    // 1. Convert buffer to base64
    const base64Image = imageBuffer.toString("base64");
    
    // We forced JPEG in the pre-processor, so we hardcode the mime type here
    const dataUri = `data:image/jpeg;base64,${base64Image}`;

    // 2. OCR.space requires URLSearchParams for POST body
    const formData = new URLSearchParams();
    formData.append("apikey", process.env.OCR_SPACE_API_KEY);
    formData.append("base64Image", dataUri);
    formData.append("language", "eng");
    formData.append("isOverlayRequired", "false");

    // 3. Send Request
    const response = await fetch("https://api.ocr.space/parse/image", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData,
    });

    const result = await response.json();

    // 4. Handle Errors from API
    if (result.IsErroredOnProcessing) {
      throw new Error(result.ErrorMessage?.[0] || "OCR processing failed");
    }

    // 5. Extract Text
    const text = result.ParsedResults?.[0]?.ParsedText;

    if (!text || text.trim() === "") {
      // Don't crash, just return empty so AI can handle it gracefully
      return { text: "No readable text found in image.", confidence: 0 };
    }

    return {
      text: text,
      confidence: 99,
    };
  } catch (error) {
    console.error("OCR failed:", error.message);
    throw new Error("Failed to extract text from image");
  }
      }
