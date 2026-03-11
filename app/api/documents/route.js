import connectDB from "@/lib/db";
import Document from "@/models/Document";
import { verifyToken } from "@/lib/auth";
import { uploadToCloudinary, deleteFromCloudinary } from "@/lib/cloudinary";
import { preprocessImage } from "@/lib/image-processor";
import { summarizeText } from "@/lib/ai";
import { extractTextFromImage } from "@/lib/ocr";
import { checkRateLimit } from "@/lib/rate-limit";
import { extractTextFromPDF } from "@/lib/pdf-handler";
import { MAX_FILE_SIZE, ALLOWED_FILE_TYPES } from "@/lib/constants";
import { NextResponse } from "next/server";

async function processDocument(buffer, fileType) {
  if (fileType === "application/pdf") {
    const result = await extractTextFromPDF(buffer);
    return { text: result.text, confidence: 100 };
  }

  if (
    fileType ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    const { extractTextFromDocx } = await import("@/lib/docx-handler");
    const result = await extractTextFromDocx(buffer);
    return { text: result.text, confidence: 100 };
  }

  // Image processing (JPG, PNG)
  const processedBuffer = await preprocessImage(buffer);
  const result = await extractTextFromImage(processedBuffer);
  return { text: result.text, confidence: result.confidence };
}

export async function POST(request) {
  try {
    // ──────────────────────────────────────────────
    // 1. Authentication
    // ──────────────────────────────────────────────
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

    // ──────────────────────────────────────────────
    // 2. Rate Limiting — 5 uploads per minute
    // ──────────────────────────────────────────────
    const { allowed } = checkRateLimit(decoded.userId, 5, 60000);
    if (!allowed) {
      return NextResponse.json(
        { success: false, error: "Too many uploads. Please wait a minute." },
        { status: 429 }
      );
    }

    // ──────────────────────────────────────────────
    // 3. File Validation
    // ──────────────────────────────────────────────
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file uploaded" },
        { status: 400 }
      );
    }

    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: "Invalid file type" },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: "File too large. Maximum size is 10MB" },
        { status: 400 }
      );
    }

    // ──────────────────────────────────────────────
    // 4. Duplicate Check (before any processing to save resources)
    // ──────────────────────────────────────────────
    await connectDB();

    const existingDocument = await Document.findOne({
      userId: decoded.userId,
      originalName: file.name,
      fileSize: file.size,
    });

    if (existingDocument) {
      return NextResponse.json(
        { success: false, error: "This document has already been uploaded." },
        { status: 400 }
      );
    }

    // ──────────────────────────────────────────────
    // 5. Prepare file buffer and filename
    // ──────────────────────────────────────────────
    const startTime = Date.now();
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const originalNameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
    const cleanName = originalNameWithoutExt.replace(/[^a-zA-Z0-9]/g, "_");
    const extension = file.name.split(".").pop();
    const fileName = `${Date.now()}_${cleanName}.${extension}`;

    // ──────────────────────────────────────────────
    // 6. Process Document FIRST (extract text)
    //    This catches scanned PDFs, corrupted files, etc.
    //    BEFORE we waste a Cloudinary upload
    // ──────────────────────────────────────────────
    let ocrResult;
    try {
      ocrResult = await processDocument(buffer, file.type);
    } catch (error) {
      console.error("Document processing failed:", error.message);
      return NextResponse.json(
        {
          success: false,
          error: error.message || "Failed to process document.",
        },
        { status: 422 }
      );
    }

    // ──────────────────────────────────────────────
    // 7. Validate extracted text
    // ──────────────────────────────────────────────
    if (
      !ocrResult?.text ||
      ocrResult.text.trim().length === 0 ||
      ocrResult.text.trim() === "No readable text found in image." ||
      ocrResult.confidence === 0
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "No text could be extracted from this document. Please upload a document with readable text.",
        },
        { status: 422 }
      );
    }

    // ──────────────────────────────────────────────
    // 8. Upload to Cloudinary (only after successful processing)
    // ──────────────────────────────────────────────
    let cloudinaryResult;
    try {
      cloudinaryResult = await uploadToCloudinary(buffer, fileName);
    } catch (error) {
      console.error("Cloudinary upload failed:", error.message);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to upload file. Please try again.",
        },
        { status: 500 }
      );
    }

    // ──────────────────────────────────────────────
    // 9. Summarize text with AI
    // ──────────────────────────────────────────────
    let summary = "";
    try {
      summary = await summarizeText(ocrResult.text);
    } catch (aiError) {
      console.error("AI summarization failed:", aiError);
      summary = "Summary generation failed. Please try again later.";
    }

    // ──────────────────────────────────────────────
    // 10. Save to Database
    // ──────────────────────────────────────────────
    const processingTime = Date.now() - startTime;

    let document;
    try {
      document = await Document.create({
        userId: decoded.userId,
        originalName: file.name,
        fileType: file.type,
        fileSize: file.size,
        imageUrl: cloudinaryResult.secure_url,
        cloudinaryId: cloudinaryResult.public_id,
        extractedText: ocrResult.text,
        summary: summary,
        summaries: { detailed: summary },
        summaryType: "detailed",
        status: "completed",
        processingTime: processingTime,
      });
    } catch (dbError) {
      console.error("Database save failed:", dbError);

      // Clean up the Cloudinary upload since we can't save the document
      try {
        await deleteFromCloudinary(cloudinaryResult.public_id);
      } catch (cleanupError) {
        console.error("Cloudinary cleanup failed:", cleanupError);
      }

      return NextResponse.json(
        {
          success: false,
          error: "Failed to save document. Please try again.",
        },
        { status: 500 }
      );
    }

    // ──────────────────────────────────────────────
    // 11. Success Response
    // ──────────────────────────────────────────────
    return NextResponse.json(
      {
        success: true,
        data: {
          document: {
            _id: document._id,
            originalName: document.originalName,
            status: document.status,
            processingTime: document.processingTime,
          },
        },
      },
      { status: 201 }
    );
  } catch (error) {
    // ──────────────────────────────────────────────
    // Global Error Handler — catches anything unexpected
    // ──────────────────────────────────────────────
    console.error("Upload error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to process document",
      },
      { status: 500 }
    );
  }
}

export async function GET(request) {
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

    await connectDB();

    const documents = await Document.find({ userId: decoded.userId })
      .sort({ createdAt: -1 })
      .select("-extractedText -summary -summaries");

    return NextResponse.json({ success: true, data: { documents } });
  } catch (error) {
    console.error("Fetch documents error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch documents" },
      { status: 500 }
    );
  }
      }
