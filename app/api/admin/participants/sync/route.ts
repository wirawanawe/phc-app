import { NextRequest, NextResponse } from "next/server";
import syncParticipantsData from "@/app/scripts/sync-participants";
import { verifyToken } from "@/app/utils/auth";

export async function POST(req: NextRequest) {
  try {
    // Get token from cookie
    const token = req.cookies.get("phc_token")?.value;

    // If no token in cookie, check header as fallback
    const authHeader = req.headers.get("authorization");
    const headerToken =
      authHeader && authHeader.startsWith("Bearer ")
        ? authHeader.split(" ")[1]
        : null;

    // Use token from cookie or header
    const authToken = token || headerToken;

    if (!authToken) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Verify token and ensure user is admin
    const payload = verifyToken(authToken);
    if (!payload || !payload.userId || payload.role !== "admin") {
      return NextResponse.json(
        { error: "You don't have permission to perform this action" },
        { status: 403 }
      );
    }

    // Run the synchronization script
    await syncParticipantsData();

    return NextResponse.json({
      success: true,
      message: "Participant data synchronized successfully",
    });
  } catch (error) {
    console.error("Error synchronizing participant data:", error);
    return NextResponse.json(
      { error: "Failed to synchronize participant data" },
      { status: 500 }
    );
  }
}
