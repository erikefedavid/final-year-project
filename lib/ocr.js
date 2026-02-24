import { createWorker } from "tesseract.js";

export async function extractTextFromImage(imageBuffer) {
  let worker = null;

  try {
    worker = await createWorker("eng", 1, {
      cachePath: "./tessdata",
    });

    const { data } = await worker.recognize(imageBuffer);

    return {
      text: data.text,
      confidence: data.confidence,
    };
  } catch (error) {
    console.error("OCR failed:", error);
    throw new Error("Failed to extract text from image");
  } finally {
    if (worker) {
      await worker.terminate();
    }
  }
}