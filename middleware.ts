import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/app/utils/auth";

// Define paths that don't require authentication
const publicPaths = [
  "/login",
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/check-email",
  "/api/public/",
  "/uploads/",
  "/",
  "/articles",
  "/doctors",
  "/health-programs",
  "/health-info",
  "/mental-health",
  "/bmi-calculator",
  "/hubungi-kami",
];

export async function middleware(request: NextRequest) {
  // Check if the path is public
  const isPublicPath = publicPaths.some(
    (path) =>
      request.nextUrl.pathname.startsWith(path) ||
      request.nextUrl.pathname === path
  );

  // Skip authentication for public paths
  if (isPublicPath) {
    return NextResponse.next();
  }

  // Get token from cookie
  const token = request.cookies.get("phc_token")?.value;

  if (!token) {
    // If the token is missing and we're accessing an API route, return a JSON response
    if (request.nextUrl.pathname.startsWith("/api/")) {
      return NextResponse.json(
        {
          error:
            "Sesi login Anda telah berakhir. Harap login kembali untuk melanjutkan.",
          authenticated: false,
        },
        { status: 401 }
      );
    }

    // For UI routes, redirect to login page
    return NextResponse.redirect(new URL("/login?expired=true", request.url));
  }

  try {
    // Verify the token
    const decoded = verifyToken(token);

    if (!decoded) {
      // If the token is invalid and we're accessing an API route, return a JSON response
      if (request.nextUrl.pathname.startsWith("/api/")) {
        return NextResponse.json(
          {
            error:
              "Sesi login Anda telah berakhir. Harap login kembali untuk melanjutkan.",
            authenticated: false,
          },
          { status: 401 }
        );
      }

      // For UI routes, redirect to login page with expired parameter
      return NextResponse.redirect(new URL("/login?expired=true", request.url));
    }

    // Get client IP address
    const clientIp =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      "unknown";

    // Get session IP from request headers (if exists)
    const sessionIp = request.cookies.get("session_ip")?.value;

    // If no session IP exists yet, set it
    if (!sessionIp) {
      const response = NextResponse.next();
      response.cookies.set({
        name: "session_ip",
        value: clientIp,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 30, // 30 minutes
        path: "/",
        sameSite: "lax",
      });
      return response;
    }

    // Compare current IP with session IP
    if (sessionIp !== clientIp) {
      // If IP has changed and we're accessing an API route, return a JSON response
      if (request.nextUrl.pathname.startsWith("/api/")) {
        return NextResponse.json(
          {
            error:
              "Terdeteksi penggunaan dari perangkat atau lokasi yang berbeda. Harap login kembali untuk alasan keamanan.",
            authenticated: false,
            reason: "ip_changed",
          },
          { status: 401 }
        );
      }

      // For UI routes, redirect to login page with ip_changed parameter
      const response = NextResponse.redirect(
        new URL("/login?expired=true&reason=ip_changed", request.url)
      );
      response.cookies.delete("phc_token");
      response.cookies.delete("session_ip");
      return response;
    }

    // Renew the session by updating the expiration time
    const response = NextResponse.next();

    // Update token expiration
    response.cookies.set({
      name: "phc_token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 30, // 30 minutes
      path: "/",
      sameSite: "lax",
    });

    // Update session IP expiration
    response.cookies.set({
      name: "session_ip",
      value: clientIp,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 30, // 30 minutes
      path: "/",
      sameSite: "lax",
    });

    return response;
  } catch (error) {
    console.error("Middleware authentication error:", error);

    // If there's an error and we're accessing an API route, return a JSON response
    if (request.nextUrl.pathname.startsWith("/api/")) {
      return NextResponse.json(
        {
          error: "Terjadi kesalahan saat validasi sesi. Harap login kembali.",
          authenticated: false,
        },
        { status: 401 }
      );
    }

    // For UI routes, redirect to login
    const response = NextResponse.redirect(
      new URL("/login?expired=true", request.url)
    );
    response.cookies.delete("phc_token");
    response.cookies.delete("session_ip");
    return response;
  }
}

// Configure the middleware to run on specific paths
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public directory
     */
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
};
