import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { verifyToken } from "@/app/utils/auth";

export async function POST(request: NextRequest) {
  try {
    // Check user authentication - prioritize cookie token
    let isAuthenticated = false;
    let userData = null;

    // 1. Try to get token from cookie
    const token = request.cookies.get("phc_token")?.value;
    if (token) {
      try {
        const payload = verifyToken(token);
        if (payload && payload.role === "admin") {
          isAuthenticated = true;
          userData = {
            userId: payload.userId,
            role: payload.role,
          };
          console.log("Authentication: User authenticated with cookie token");
        }
      } catch (e) {
        console.error("Error verifying token from cookie:", e);
      }
    }

    // 2. Fallback to header authentication if cookie auth failed
    if (!isAuthenticated) {
      // Try Authorization header
      const authHeader = request.headers.get("authorization");
      const headerToken =
        authHeader && authHeader.startsWith("Bearer ")
          ? authHeader.split(" ")[1]
          : null;

      if (headerToken) {
        try {
          const payload = verifyToken(headerToken);
          if (payload && payload.role === "admin") {
            isAuthenticated = true;
            userData = {
              userId: payload.userId,
              role: payload.role,
            };
            console.log(
              "Authentication: User authenticated with authorization header"
            );
          }
        } catch (e) {
          console.error("Error verifying token from authorization header:", e);
        }
      }

      // 3. Try legacy x-user header as last resort
      if (!isAuthenticated) {
        const userHeader = request.headers.get("x-user");
        if (userHeader) {
          try {
            userData = JSON.parse(userHeader);
            if (userData.role === "admin") {
              isAuthenticated = true;
              console.log(
                "Authentication: User authenticated with x-user header"
              );
            }
          } catch (e) {
            console.error("Failed to parse user data from header:", e);
          }
        }
      }
    }

    // Return error if not authenticated
    if (!isAuthenticated || !userData) {
      console.error("Authentication failed. No valid credentials found.");
      return NextResponse.json(
        { success: false, error: "Unauthorized - Admin access required" },
        { status: 401 }
      );
    }

    // Process the form data
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Invalid file type. Only JPEG, PNG, and WebP images are allowed.",
        },
        { status: 400 }
      );
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: "File size exceeds the 5MB limit" },
        { status: 400 }
      );
    }

    // Ensure uploads directory exists
    const uploadDir = path.join(process.cwd(), "public/uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Get file type and generate a unique filename
    const fileType = file.type.split("/")[1];
    const fileName = `${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 15)}.${fileType}`;
    const filePath = path.join(uploadDir, fileName);

    // Convert file to buffer and save
    try {
      const buffer = Buffer.from(await file.arrayBuffer());
      fs.writeFileSync(filePath, buffer);
    } catch (writeError) {
      console.error("Error writing file:", writeError);
      return NextResponse.json(
        { success: false, error: "Failed to save file" },
        { status: 500 }
      );
    }

    // Return the URL to the uploaded file
    return NextResponse.json({
      success: true,
      data: {
        url: `/uploads/${fileName}`,
        originalName: file.name,
        type: file.type,
        size: file.size,
      },
    });
  } catch (error) {
    console.error("Error uploading file:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { success: false, error: `File upload failed: ${errorMessage}` },
      { status: 500 }
    );
  }
}
