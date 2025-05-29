import { NextRequest, NextResponse } from "next/server";
import { sequelize } from "@/app/models";
import { verifyToken } from "@/app/utils/auth";
import { QueryTypes } from "sequelize";

// GET health records for a user
export async function GET(req: NextRequest) {
  try {
    // Get the user ID from query params
    const url = new URL(req.url);
    const userId = url.searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Get token from cookie for authentication
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

    // Verify the token
    const payload = verifyToken(authToken);
    if (!payload || !payload.userId) {
      return NextResponse.json(
        { error: "Invalid authentication token" },
        { status: 401 }
      );
    }

    // Check if the requesting user has permission to access these records
    // (Either the user is requesting their own records or is a doctor/admin)
    if (
      payload.userId !== userId &&
      !["doctor", "admin"].includes(payload.role)
    ) {
      return NextResponse.json(
        { error: "You do not have permission to access these records" },
        { status: 403 }
      );
    }

    // For now, we'll return dummy data since we don't have a real database table for health records yet
    // In a real implementation, you would query your database
    const healthRecords = [
      {
        id: "1",
        date: "2023-05-15",
        type: "General Checkup",
        description:
          "Annual health examination. Blood pressure normal, weight stable.",
        doctor: "Dr. Jane Smith",
      },
      {
        id: "2",
        date: "2023-02-10",
        type: "Blood Test",
        description: "Complete blood count. All values within normal range.",
        doctor: "Dr. Michael Johnson",
      },
      {
        id: "3",
        date: "2022-11-22",
        type: "Vaccination",
        description: "Influenza vaccine administered.",
        doctor: "Dr. Sarah Williams",
      },
    ];

    return NextResponse.json(healthRecords);
  } catch (error) {
    console.error("API: Error fetching health records:", error);
    return NextResponse.json(
      { error: "Failed to fetch health records" },
      { status: 500 }
    );
  }
}
