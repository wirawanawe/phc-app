import { NextRequest, NextResponse } from "next/server";
import { generateToken, verifyToken } from "@/app/utils/auth";
import { sequelize } from "@/app/models";
import { QueryTypes } from "sequelize";
import { cookies } from "next/headers";

// Fungsi untuk menyegarkan token
export async function POST(req: NextRequest) {
  try {
    // Dapatkan token dari cookie
    const token = req.cookies.get("phc_token")?.value;

    // Jika tidak ada token di cookie, periksa header sebagai fallback
    const authHeader = req.headers.get("authorization");
    const headerToken =
      authHeader && authHeader.startsWith("Bearer ")
        ? authHeader.split(" ")[1]
        : null;

    // Gunakan token dari cookie atau header
    const oldToken = token || headerToken;

    if (!oldToken) {
      console.error("API: No token found for refresh");
      return NextResponse.json(
        { error: "No authentication token found" },
        { status: 401 }
      );
    }

    // Coba decode token lama untuk mendapatkan informasi user
    // Bahkan jika token sudah expired, kita bisa mencoba mendapatkan userId dan role
    try {
      // Decode without verifikasi expiry
      const jwt = require("jsonwebtoken");
      const decoded = jwt.decode(oldToken);

      if (!decoded || !decoded.userId) {
        console.error("API: Invalid token format for refresh");
        return NextResponse.json(
          { error: "Invalid token format" },
          { status: 401 }
        );
      }

      const userId = decoded.userId;
      const role = decoded.role;

      // Verify the user still exists and is active
      const user = await sequelize.query(
        "SELECT id, role FROM users WHERE id = :userId AND isActive = true",
        {
          replacements: { userId },
          type: QueryTypes.SELECT,
        }
      );

      if (!user || user.length === 0) {
        console.error("API: User not found or inactive");
        return NextResponse.json(
          { error: "User not found or inactive" },
          { status: 401 }
        );
      }

      // Generate new token
      const newToken = generateToken({ userId, role });

      // Create response with new token
      const response = NextResponse.json(
        { success: true, user: { id: userId, role } },
        { status: 200 }
      );

      // Set the new token in cookie
      response.cookies.set("phc_token", newToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 24 * 60 * 60, // 24 hours in seconds
      });

      return response;
    } catch (error) {
      console.error("API: Error refreshing token:", error);
      return NextResponse.json(
        {
          error: "Failed to refresh token",
          message: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error("API: Global error during token refresh:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
