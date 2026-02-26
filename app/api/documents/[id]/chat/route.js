import connectDB from "@/lib/db";
import Document from "@/models/Document";
import { verifyToken } from "@/lib/auth";
import { chatWithDocument } from "@/lib/ai";
import { NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";

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

    // Rate limiting - 20 chat messages per minute
    const { allowed } = checkRateLimit(`chat_${decoded.userId}`, 20, 60000);

    if (!allowed) {
      return NextResponse.json(
        { success: false, error: "Too many questions. Please wait a minute." },
        { status: 429 }
      );
    }

    const { id } = await params;

    const body = await request.json();
    const { question } = body;

    if (!question || question.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "Question is required" },
        { status: 400 }
      );
    }

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

    const answer = await chatWithDocument(document.extractedText, question);

    return NextResponse.json({
      success: true,
      data: { answer },
    });
  } catch (error) {
    console.error("Chat error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to answer question" },
      { status: 500 }
    );
  }
}