import OpenAI from "openai";
import { SUMMARY_TYPES } from "@/lib/constants";

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

export async function summarizeText(text, summaryType = "detailed") {
  try {
    if (!text || text.trim().length === 0) {
      return "No text available to summarize.";
    }

    const trimmedText = text.length > 12000
      ? text.substring(0, 12000) + "..."
      : text;

    const typeConfig = SUMMARY_TYPES[summaryType] || SUMMARY_TYPES.detailed;

    const response = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: `You are an academic assistant. ${typeConfig.prompt} Do not add information that is not in the original text.`,
        },
        {
          role: "user",
          content: `Process the following academic text:\n\n${trimmedText}`,
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

export async function chatWithDocument(extractedText, question) {
  try {
    if (!extractedText || extractedText.trim().length === 0) {
      return "No document text available to answer questions from.";
    }

    const trimmedText = extractedText.length > 10000
      ? extractedText.substring(0, 10000) + "..."
      : extractedText;

    const response = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: "You are an academic assistant. Answer the user's question based ONLY on the provided document text. If the answer is not found in the document, say 'This information is not found in the uploaded document.' Do not use external knowledge. Be concise and accurate.",
        },
        {
          role: "user",
          content: `Document text:\n${trimmedText}\n\nQuestion: ${question}`,
        },
      ],
      max_tokens: 500,
      temperature: 0.3,
    });

    const answer = response.choices[0].message.content;

    return answer;
  } catch (error) {
    console.error("Chat failed:", error.message);
    throw new Error("Failed to answer question");
  }
}