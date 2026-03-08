import sharp from "sharp";

export async function preprocessImage(fileBuffer) {
  try {
    const metadata = await sharp(fileBuffer).metadata();

    let pipeline = sharp(fileBuffer);

    if (metadata.width > 2000 || metadata.height > 2000) {
      pipeline = pipeline.resize(2000, 2000, {
        fit: "inside",
        withoutEnlargement: true,
      });
    }

    const processedBuffer = await pipeline
      .grayscale()
      .normalize()
      .sharpen()
       .png()
      .toBuffer();

    return processedBuffer;
  } catch (error) {
    console.error("Image pre-processing failed:", error);
    return fileBuffer;
  }
}
