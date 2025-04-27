import { NextRequest, NextResponse } from "next/server";
import { UserModel, initializeDatabase } from "@/app/models";

export async function GET(request: NextRequest) {
  try {
    // Make sure database is initialized
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
    });

    return NextResponse.json({ exists: !!existingUser }, { status: 200 });
  } catch (error) {
    console.error("Error checking email:", error);
    return NextResponse.json(
      { error: "Failed to check email" },
      { status: 500 }
    );
  }
}
