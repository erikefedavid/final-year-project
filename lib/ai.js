import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

export async function summarizeText(text) {
  try {
    if (!text || text.trim().length === 0) {
      return "No text available to summarize.";
    }

    const trimmedText = text.length > 12000
      ? text.substring(0, 12000) + "..."
      : text;

    const response = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content:
            "You are an academic assistant. Your job is to summarize academic texts clearly and concisely. Preserve key concepts, definitions, and important details. Structure your summary with clear paragraphs. Do not add information that is not in the original text.",
        },
        {
          role: "user",
          content: `Please summarize the following academic text:\n\n${trimmedText}`,
        },
      ],
      max_tokens: 1000,
      temperature: 0.3,
    });

    const summary = response.choices[0].message.content;

    return summary;
  } catch (error) {
    console.error("AI summarization failed:", error.message);
    throw new Error("Failed to generate summary");
  }
}