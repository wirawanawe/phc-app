import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { UserModel, initializeDatabase } from "@/app/models";

// Force dynamic rendering for this route
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    // Make sure database is initialized
    await initializeDatabase();

    // Get token from cookies
    const token = request.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret") as {
      userId: string;
    };

    // Get user from database
    const user = await UserModel.findByPk(decoded.userId, {
      attributes: { exclude: ["password"] },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error fetching current user:", error);
    return NextResponse.json(
      { error: "Failed to fetch current user" },
      { status: 500 }
    );
  }
}
