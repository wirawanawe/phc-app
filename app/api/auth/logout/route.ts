import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    console.log("LOGOUT API: Processing logout request");

    // Create a response
    const response = NextResponse.json({
      message: "Logged out successfully",
    });

    // Clear auth cookie
    console.log("LOGOUT API: Clearing phc_token cookie");
    response.cookies.set({
      name: "phc_token",
      value: "",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 0,
      path: "/",
    });

    // Clear other possible auth token cookies for completeness
    console.log("LOGOUT API: Clearing additional auth cookies");
    response.cookies.set({
      name: "token",
      value: "",
      expires: new Date(0),
      path: "/",
    });

    response.cookies.set({
      name: "auth_token",
      value: "",
      expires: new Date(0),
      path: "/",
    });

    console.log("LOGOUT API: Logout completed successfully");
    return response;
  } catch (error) {
    console.error("LOGOUT API ERROR:", error);
    return NextResponse.json({ error: "Failed to logout" }, { status: 500 });
  }
}
