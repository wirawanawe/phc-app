import { NextRequest, NextResponse } from "next/server";
import { UserModel, initializeDatabase } from "@/app/models";
import { compare } from "bcryptjs";
import { cookies } from "next/headers";
import { Op } from "sequelize";
import { generateToken } from "@/app/utils/auth";

// Define JWT_SECRET with the same value as in auth.ts
const JWT_SECRET =
  process.env.JWT_SECRET || "default-secret-key-for-phc-app-2024";

export async function POST(request: NextRequest) {
  console.log("LOGIN API: Received login request");
  try {
    await initializeDatabase();
    console.log("LOGIN API: Database initialized");

    const body = await request.json();
    const { email, password } = body;
    console.log(`LOGIN API: Attempting login for: ${email}`);

    if (!email || !password) {
      console.log("LOGIN API: Missing email/username or password");
      return NextResponse.json(
        { error: "Email/username and password are required" },
        { status: 400 }
      );
    }

    // Find user by email or username
    const user = await UserModel.findOne({
      where: {
        [Op.or]: [
          { email },
          { username: email }, // Support using username in the email field
        ],
      },
    });

    if (!user) {
      console.log(`LOGIN API: User not found for: ${email}`);
      return NextResponse.json(
        { error: "Invalid email/username or password" },
        { status: 401 }
      );
    }
    console.log(`LOGIN API: User found with ID: ${user.id}`);

    // Verify password
    const isPasswordValid = await compare(password, user.password);
    if (!isPasswordValid) {
      console.log(`LOGIN API: Invalid password for user: ${user.id}`);
      return NextResponse.json(
        { error: "Invalid email/username or password" },
        { status: 401 }
      );
    }
    console.log(`LOGIN API: Password verified for user: ${user.id}`);

    // Update lastLogin
    await user.update({ lastLogin: new Date().toISOString() });
    console.log(`LOGIN API: Updated lastLogin for user: ${user.id}`);

    // Get user data without sensitive information
    const userData = user.get({ plain: true });
    delete userData.password;

    // Generate a token
    const token = generateToken({
      userId: userData.id,
      role: userData.role,
    });

    console.log("Token generated successfully");

    // Set the token as a cookie
    const response = NextResponse.json({
      success: true,
      message: "Login successful",
      user: {
        id: userData.id,
        name: userData.fullName,
        fullName: userData.fullName,
        username: userData.username,
        email: userData.email,
        role: userData.role,
        isActive: userData.isActive,
      },
    });

    // Set cookies with appropriate options
    response.cookies.set({
      name: "phc_token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24, // 1 day
      path: "/",
      sameSite: "lax",
    });

    console.log("Cookie set successfully");

    return response;
  } catch (error) {
    console.error("LOGIN API: Error during login:", error);
    let errorMessage = "Login gagal";

    if (error instanceof Error) {
      errorMessage = `Login gagal: ${error.message}`;
    }

    return NextResponse.json(
      {
        error: errorMessage,
        details: error instanceof Error ? error.stack : null,
      },
      { status: 500 }
    );
  }
}
