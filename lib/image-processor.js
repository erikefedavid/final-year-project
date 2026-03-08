import sharp from "sharp";

export async function preprocessImage(fileBuffer) {
  try {
    const metadata = await sharp(fileBuffer).metadata();

    let pipeline = sharp(fileBuffer);

    // OCR.space has a 1MB limit. We must resize heavily if it's too big.
    if (metadata.width > 1500 || metadata.height > 1500) {
      pipeline = pipeline.resize(1500, 1500, {
        fit: "inside",
        withoutEnlargement: true,
      });
    }

    const processedBuffer = await pipeline
      .grayscale()
      .normalize()
      .jpeg({ quality: 80 }) // Force JPEG to keep size under 1MB limit
      .toBuffer();

    return processedBuffer;
  } catch (error) {
    console.error("Image pre-processing failed:", error);
    // If sharp fails, return original buffer (fallback)
    return fileBuffer; 
  }
}
