import { NextRequest, NextResponse } from "next/server";
import runArticleSeeder from "@/app/seed/articles";
import { verifyToken } from "@/app/utils/auth";

// POST /api/seed/articles - Seed articles
export async function POST(request: NextRequest) {
  try {
    // Check authorization
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json(
        { error: "Authorization header is required" },
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];
    const decoded = await verifyToken(token);

    if (!decoded || decoded.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized. Only admin can seed articles" },
        { status: 403 }
      );
    }

    // Run the article seeder
    const success = await runArticleSeeder();

    if (success) {
      return NextResponse.json({ message: "Articles seeded successfully" });
    } else {
      return NextResponse.json(
        { error: "Failed to seed articles" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error seeding articles:", error);
    return NextResponse.json(
      { error: "Failed to seed articles" },
      { status: 500 }
    );
  }
}

// Only for development - GET /api/seed/articles - Seed articles without auth
export async function GET(request: NextRequest) {
  // Only allow this in development environment
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json(
      { error: "This endpoint is only available in development" },
      { status: 403 }
    );
  }

  try {
    // Run the article seeder
    const success = await runArticleSeeder();

    if (success) {
      return NextResponse.json({ message: "Articles seeded successfully" });
    } else {
      return NextResponse.json(
        { error: "Failed to seed articles" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error seeding articles:", error);
    return NextResponse.json(
      { error: "Failed to seed articles" },
      { status: 500 }
    );
  }
}
