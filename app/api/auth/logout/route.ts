import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    // Create response
    const response = NextResponse.json({
      success: true,
      message: "Logout berhasil",
    });

    // Clear auth cookies
    response.cookies.delete("phc_token");
    response.cookies.delete("session_ip");

    return response;
  } catch (error) {
    console.error("LOGOUT API: Error during logout:", error);

    // Even if there's an error, attempt to clear cookies
    const response = NextResponse.json(
      {
        success: false,
        error: "Terjadi kesalahan saat logout",
      },
      { status: 500 }
    );

    response.cookies.delete("phc_token");
    response.cookies.delete("session_ip");

    return response;
  }
}
