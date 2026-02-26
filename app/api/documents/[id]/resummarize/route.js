import connectDB from "@/lib/db";
import Document from "@/models/Document";
import { verifyToken } from "@/lib/auth";
import { summarizeText } from "@/lib/ai";
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
   
    // Rate limiting - 10 resummarize per minute
    const { allowed } = checkRateLimit(`resum_${decoded.userId}`, 10, 60000);

    if (!allowed) {
      return NextResponse.json(
        { success: false, error: "Too many requests. Please wait a minute." },
        { status: 429 }
      );
    }

    const { id } = await params;

    const body = await request.json();
    const { summaryType } = body;

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

    const summary = await summarizeText(document.extractedText, summaryType);

    document.summary = summary;
    document.summaryType = summaryType;
    await document.save();

    return NextResponse.json({
      success: true,
      data: {
        summary: summary,
        summaryType: summaryType,
      },
    });
  } catch (error) {
    console.error("Re-summarize error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to regenerate summary" },
      { status: 500 }
    );
  }
}