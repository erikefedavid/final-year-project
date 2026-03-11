import OpenAI from "openai";

const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

// Primary model + fallback in case it gets deprecated
const PRIMARY_MODEL = "meta-llama/llama-4-scout-17b-16e-instruct";
const FALLBACK_MODEL = "llama-3.2-11b-vision-preview";

const MAX_IMAGE_BYTES = 20 * 1024 * 1024; // 20MB (Groq's limit)

function detectMimeType(buffer) {
  if (buffer[0] === 0x89 && buffer[1] === 0x50) return "image/png";
  if (buffer[0] === 0xff && buffer[1] === 0xd8) return "image/jpeg";
  if (
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46
  )
    return "image/webp";

  // Default to JPEG — Groq handles it well
  return "image/jpeg";
}

async function callVisionModel(model, base64, mimeType) {
  const response = await groq.chat.completions.create({
    model,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image_url",
            image_url: {
              url: `data:${mimeType};base64,${base64}`,
            },
          },
          {
            type: "text",
            text: `Extract ALL text from this image exactly as it appears.
Include every word, number, and punctuation mark.
Preserve the original structure and formatting.
Do not summarize, interpret, or add anything.
If no text is found, respond with exactly: NO_TEXT_FOUND`,
          },
        ],
      },
    ],
    max_tokens: 8192,
    temperature: 0,
  });

  return response?.choices?.[0]?.message?.content?.trim() || "";
}

export async function extractTextFromImage(imageBuffer) {
  // 1. Input validation
  if (!imageBuffer || imageBuffer.length === 0) {
    throw new Error("No image provided or image is empty.");
  }

  // 2. Size check
  if (imageBuffer.length > MAX_IMAGE_BYTES) {
    throw new Error(
      "Image is too large for text extraction. Please upload a smaller image."
    );
  }

  // 3. Detect MIME type from magic bytes
  const mimeType = detectMimeType(imageBuffer);

  // 4. Convert to base64
  const base64 = Buffer.from(imageBuffer).toString("base64");

  try {
    // 5. Try primary model first
    let text;
    try {
      text = await callVisionModel(PRIMARY_MODEL, base64, mimeType);
    } catch (primaryError) {
      console.warn(
        `Primary model failed (${PRIMARY_MODEL}), trying fallback...`,
        primaryError.message
      );
      text = await callVisionModel(FALLBACK_MODEL, base64, mimeType);
    }

    // 6. Handle empty results
    if (!text || text === "NO_TEXT_FOUND") {
      return {
        text: "No readable text found in image.",
        confidence: 0,
      };
    }

    return {
      text: text,
      confidence: 95,
    };
  } catch (error) {
    console.error("Vision OCR failed:", error.message);

    // 7. Handle specific error types
    if (error?.status === 429) {
      throw new Error(
        "Text extraction is temporarily unavailable due to high demand. Please try again in a moment."
      );
    }

    if (error?.status === 413) {
      throw new Error(
        "Image is too large to process. Please upload a smaller or lower resolution image."
      );
    }

    if (error?.status === 401) {
      throw new Error(
        "Text extraction service is not configured properly. Please contact support."
      );
    }

    throw new Error(
      "Failed to extract text from image. Please try again or upload a clearer image."
    );
  }
}
