import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/app/utils/auth";

// Force dynamic rendering for this route
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    // Get token from cookie
    const token = req.cookies.get("phc_token")?.value;

    if (!token) {
      return NextResponse.json(
        { valid: false, error: "No authentication token found" },
        { status: 401 }
      );
    }

    // Verify the token
    const jwt = require("jsonwebtoken");
    const JWT_SECRET =
      process.env.JWT_SECRET || "default-secret-key-for-phc-app-2024";

    try {
      const decoded = jwt.verify(token, JWT_SECRET);

      if (!decoded || !decoded.userId) {
        return NextResponse.json(
          { valid: false, error: "Invalid token format" },
          { status: 401 }
        );
      }

      // Session is valid
      return NextResponse.json({
        valid: true,
        user: {
          id: decoded.userId,
          role: decoded.role,
        },
      });
    } catch (error) {
      console.error("SESSION CHECK API: Unhandled error:", error);
      return NextResponse.json(
        { valid: false, error: "Session validation failed" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("SESSION CHECK API: Unhandled error:", error);
    return NextResponse.json(
      { valid: false, error: "Session validation failed" },
      { status: 500 }
    );
  }
}
