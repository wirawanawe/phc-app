import { NextRequest, NextResponse } from "next/server";
import { ParticipantModel, initializeDatabase } from "@/app/models";
import { verifyToken } from "@/app/utils/auth";

// Force dynamic rendering for this route
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    // Make sure database is initialized
    await initializeDatabase();

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

    // Verify the token and get user ID
    const payload = verifyToken(authToken);
    if (!payload || !payload.userId) {
      return NextResponse.json(
        { error: "Invalid authentication token" },
        { status: 401 }
      );
    }

    const userId = payload.userId;

    // Check if the participant record exists with the same ID as the user
    const participant = await ParticipantModel.findByPk(userId);

    if (!participant) {
      return NextResponse.json(
        { error: "Participant profile not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      participantId: participant.id,
    });
  } catch (error) {
    console.error("API: Error checking participant profile:", error);
    return NextResponse.json(
      { error: "Failed to check participant profile" },
      { status: 500 }
    );
  }
}
