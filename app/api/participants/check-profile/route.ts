import { NextRequest, NextResponse } from "next/server";
import { sequelize } from "@/app/models";
import { verifyToken } from "@/app/utils/auth";
import { QueryTypes } from "sequelize";

export async function GET(req: NextRequest) {
  console.log("API: Received request to check participant profile");
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
      console.log("API: No authentication token found");
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Verify the token and get user ID
    const payload = verifyToken(authToken);
    if (!payload || !payload.userId) {
      console.log("API: Invalid token or missing userId in payload");
      return NextResponse.json(
        { error: "Invalid authentication token" },
        { status: 401 }
      );
    }

    const userId = payload.userId;
    console.log("API: Authenticated user ID:", userId);

    // Check if the participant record exists with the same ID as the user
    const [participant] = await sequelize.query(
      `
      SELECT id FROM participants WHERE id = ?
      `,
      {
        replacements: [userId],
        type: QueryTypes.SELECT,
      }
    );

    if (!participant) {
      console.log("API: No participant profile found for user ID:", userId);
      return NextResponse.json(
        { error: "Participant profile not found" },
        { status: 404 }
      );
    }

    console.log("API: Participant profile found for user ID:", userId);
    return NextResponse.json({
      success: true,
      participantId: (participant as any).id,
    });
  } catch (error) {
    console.error("API: Error checking participant profile:", error);
    return NextResponse.json(
      { error: "Failed to check participant profile" },
      { status: 500 }
    );
  }
}
