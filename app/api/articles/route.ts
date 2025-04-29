import { NextRequest, NextResponse } from "next/server";
import { ArticleModel } from "@/app/models";
import { verifyToken } from "@/app/utils/auth";

// Helper function to check authentication from multiple sources
async function authenticateRequest(request: NextRequest) {
  // 1. Try Authorization header
  const authHeader = request.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    const decoded = await verifyToken(token);
    if (decoded && decoded.role === "admin") {
      return { authenticated: true, user: decoded };
    }
  }

  // 2. Try cookie
  const token = request.cookies.get("phc_token")?.value;
  if (token) {
    const decoded = await verifyToken(token);
    if (decoded && decoded.role === "admin") {
      return { authenticated: true, user: decoded };
    }
  }

  // Not authenticated
  return { authenticated: false, user: null };
}

// GET /api/articles - Get all articles
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const published = searchParams.get("published");

    let whereClause = {};

    // Filter by published status if specified
    if (published === "true") {
      whereClause = { isPublished: true };
    } else if (published === "false") {
      whereClause = { isPublished: false };
    }

    const articles = await ArticleModel.findAll({
      where: whereClause,
      order: [
        ["publishedDate", "DESC"],
        ["createdAt", "DESC"],
      ],
    });

    return NextResponse.json(articles);
  } catch (error) {
    console.error("Error fetching articles:", error);
    return NextResponse.json(
      { error: "Failed to fetch articles" },
      { status: 500 }
    );
  }
}

// POST /api/articles - Create a new article
export async function POST(request: NextRequest) {
  try {
    // Check authentication using the helper function
    const authResult = await authenticateRequest(request);
    if (!authResult.authenticated) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const data = await request.json();

    // Validate required fields
    if (!data.title || !data.content || !data.summary || !data.author) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create the article
    const newArticle = await ArticleModel.create({
      ...data,
      // Set publishedDate if article is being published
      publishedDate: data.isPublished ? new Date() : null,
    });

    return NextResponse.json(newArticle, { status: 201 });
  } catch (error) {
    console.error("Error creating article:", error);
    return NextResponse.json(
      { error: "Failed to create article" },
      { status: 500 }
    );
  }
}
