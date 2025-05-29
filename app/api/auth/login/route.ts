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
  try {
    // Parse request JSON safely
    let email = "";
    let password = "";

    try {
      const body = await request.json();
      email = body.email || "";
      password = body.password || "";
    } catch (parseError) {
      console.error("LOGIN API: Error parsing request body", parseError);
      return NextResponse.json(
        { error: "Invalid request format" },
        { status: 400 }
      );
    }

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email/username dan password diperlukan" },
        { status: 400 }
      );
    }

    // Initialize database with error handling
    try {
      await initializeDatabase();
    } catch (dbError) {
      console.error("LOGIN API: Database initialization error", dbError);
      return NextResponse.json(
        { error: "Tidak dapat terhubung ke database" },
        { status: 500 }
      );
    }

    // Find user by email or username
    let user;
    try {
      user = await UserModel.findOne({
        where: {
          [Op.or]: [
            { email },
            { username: email }, // Support using username in the email field
          ],
        },
      });
    } catch (queryError) {
      console.error("LOGIN API: Error querying user", queryError);
      return NextResponse.json(
        { error: "Terjadi kesalahan saat mencari pengguna" },
        { status: 500 }
      );
    }

    if (!user) {
      return NextResponse.json(
        { error: "Email/username atau password tidak valid" },
        { status: 401 }
      );
    }

    // Check if user is active
    if (user.isActive === false) {
      return NextResponse.json(
        { error: "Akun ini tidak aktif. Silakan hubungi administrator." },
        { status: 403 }
      );
    }

    // Verify password
    let isPasswordValid = false;
    try {
      isPasswordValid = await compare(password, user.password);
    } catch (passwordError) {
      console.error("LOGIN API: Error comparing passwords", passwordError);
      return NextResponse.json(
        { error: "Terjadi kesalahan saat verifikasi password" },
        { status: 500 }
      );
    }

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Email/username atau password tidak valid" },
        { status: 401 }
      );
    }

    // Update lastLogin
    try {
      await user.update({ lastLogin: new Date().toISOString() });
    } catch (updateError) {
      // Continue even if this fails - not critical
      console.error("LOGIN API: Error updating lastLogin", updateError);
    }

    // Get user data without sensitive information
    const userData = user.get({ plain: true });
    delete userData.password;

    // Generate a token
    let token;
    try {
      token = generateToken({
        userId: userData.id,
        role: userData.role,
      });
    } catch (tokenError) {
      console.error("LOGIN API: Error generating token", tokenError);
      return NextResponse.json(
        { error: "Terjadi kesalahan saat membuat token otentikasi" },
        { status: 500 }
      );
    }

    // Prepare user response data with safety checks
    const userResponseData = {
      id: userData.id,
      name: userData.fullName || "",
      fullName: userData.fullName || "",
      username: userData.username || "",
      email: userData.email || "",
      role: userData.role || "user",
      isActive: userData.isActive !== false, // Default to true if undefined
    };

    // Get client IP address
    const clientIp =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      "unknown";

    // Create response object
    const response = NextResponse.json({
      success: true,
      message: "Login berhasil",
      user: userResponseData,
      token: token,
    });

    // Set cookies with appropriate options
    try {
      // Set auth token cookie
      response.cookies.set({
        name: "phc_token",
        value: token,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 30, // 30 minutes
        path: "/",
        sameSite: "lax",
      });

      // Set session IP cookie
      response.cookies.set({
        name: "session_ip",
        value: clientIp,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 30, // 30 minutes
        path: "/",
        sameSite: "lax",
      });
    } catch (cookieError) {
      console.error("LOGIN API: Error setting cookie", cookieError);
      // Continue anyway since we're returning the user data
    }

    return response;
  } catch (error) {
    console.error("LOGIN API: Unhandled error during login:", error);
    let errorMessage = "Login gagal";

    if (error instanceof Error) {
      errorMessage = `Login gagal: ${error.message}`;
      console.error("LOGIN API: Error stack:", error.stack);
    }

    return NextResponse.json(
      {
        error: errorMessage,
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
