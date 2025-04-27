import { NextRequest, NextResponse } from "next/server";
import { UserModel, initializeDatabase } from "@/app/models";

export async function GET(request: NextRequest) {
  try {
    // Initialize database
    await initializeDatabase();

    // Get email from query parameters
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json(
        { error: "Email parameter is required" },
        { status: 400 }
      );
    }

    // Check if user with the email exists
    const existingUser = await UserModel.findOne({
      where: { email },
      attributes: ["id"], // Only fetch id to minimize data transfer
    });

    return NextResponse.json({ exists: !!existingUser }, { status: 200 });
  } catch (error) {
    console.error("Email check error:", error);
    return NextResponse.json(
      { error: "Failed to check email" },
      { status: 500 }
    );
  }
}
