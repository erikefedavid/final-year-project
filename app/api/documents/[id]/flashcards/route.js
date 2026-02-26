import connectDB from "@/lib/db";
import Document from "@/models/Document";
import { verifyToken } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rate-limit";
import { NextResponse } from "next/server";
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

export async function POST(request, { params }) {
  try {
    const token = request.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);

    if (!decoded) {
      return NextResponse.json(
        { success: false, error: "Invalid or expired token" },
        { status: 401 }
      );
    }

    const { allowed } = checkRateLimit(`flash_${decoded.userId}`, 5, 60000);

    if (!allowed) {
      return NextResponse.json(
        { success: false, error: "Too many requests. Please wait." },
        { status: 429 }
      );
    }

    const { id } = await params;

    await connectDB();

    const document = await Document.findOne({
      _id: id,
      userId: decoded.userId,
    });

    if (!document) {
      return NextResponse.json(
        { success: false, error: "Document not found" },
        { status: 404 }
      );
    }

    const trimmedText = document.extractedText.length > 8000
      ? document.extractedText.substring(0, 8000)
      : document.extractedText;

    const response = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: `You are an academic assistant. Generate exactly 5 flashcards from the provided text. Each flashcard should have a question on the front and an answer on the back. Return ONLY valid JSON in this exact format, no other text:
[
  {"front": "Question here?", "back": "Answer here."},
  {"front": "Question here?", "back": "Answer here."}
]`,
        },
        {
          role: "user",
          content: `Generate flashcards from this text:\n\n${trimmedText}`,
        },
      ],
      max_tokens: 1000,
      temperature: 0.3,
    });

    const content = response.choices[0].message.content;

    let flashcards;
    try {
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      flashcards = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      flashcards = [
        { front: "Error generating flashcards", back: "Please try again." },
      ];
    }

    return NextResponse.json({
      success: true,
      data: { flashcards },
    });
  } catch (error) {
    console.error("Flashcard error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate flashcards" },
      { status: 500 }
    );
  }
}