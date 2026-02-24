import { NextResponse } from "next/server";

export async function GET() {
  try {
    console.log("=== AI TEST START ===");
    console.log("GROK_API_KEY exists:", !!process.env.GROK_API_KEY);
    console.log("GROK_API_KEY starts with:", process.env.GROK_API_KEY?.substring(0, 8));

    const { summarizeText } = await import("@/lib/ai");

    const testText = "The cell is the basic unit of life. All living organisms are composed of one or more cells. Cells arise from pre-existing cells through the process of cell division.";

    console.log("Calling summarizeText...");
    const summary = await summarizeText(testText);
    console.log("Summary received:", summary);

    return NextResponse.json({
      success: true,
      summary: summary,
    });
  } catch (error) {
    console.error("=== AI TEST FAILED ===");
    console.error("Full error:", error);

    return NextResponse.json({
      success: false,
      error: error.message,
      name: error.name,
      status: error.status || "no status",
      code: error.code || "no code",
    });
  }
}