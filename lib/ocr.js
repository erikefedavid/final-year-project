import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

export async function extractTextFromImage(imageBuffer) {
  try {
    const base64 = imageBuffer.toString("base64");

    const isPNG = imageBuffer[0] === 0x89 && imageBuffer[1] === 0x50;
    const mimeType = isPNG ? "image/png" : "image/jpeg";

    const response = await client.chat.completions.create({
      model: "meta-llama/llama-4-scout-17b-16e-instruct",
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
              text: "Extract ALL text from this image exactly as it appears. Include every word, number, and punctuation mark. Do not summarize, interpret, or add anything. Just return the raw extracted text.",
            },
          ],
        },
      ],
      max_tokens: 4000,
      temperature: 0,
    });

    const text = response.choices[0].message.content;

    if (!text || text.trim().length === 0) {
      return { text: "No readable text found in image.", confidence: 0 };
    }

    return { text: text.trim(), confidence: 99 };
  } catch (error) {
    console.error("OCR failed:", error.message);
    throw new Error(error.message || "Failed to extract text from image");
  }
          }
