import { NextRequest, NextResponse } from "next/server";
import { ArticleModel } from "@/app/models";
import { verifyToken } from "@/app/utils/auth";

// Helper function to check authentication from multiple sources
async function authenticateRequest(request: NextRequest) {
  console.log("AUTH DEBUG: Starting authentication check");

  // 1. Try Authorization header
  const authHeader = request.headers.get("authorization");
  console.log("AUTH DEBUG: Authorization header present:", !!authHeader);

  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    console.log(
      "AUTH DEBUG: Token from header:",
      token ? `${token.substring(0, 5)}...` : "NONE"
    );

    try {
      const decoded = await verifyToken(token);
      console.log("AUTH DEBUG: Token verification result:", !!decoded);

      if (decoded && decoded.role === "admin") {
        console.log("AUTH DEBUG: Admin authenticated via header");
        return { authenticated: true, user: decoded };
      } else if (decoded) {
        console.log(
          "AUTH DEBUG: User authenticated but not admin. Role:",
          decoded.role
        );
      }
    } catch (error) {
      console.error("AUTH DEBUG: Error verifying token from header:", error);
    }
  }

  // 2. Try cookie
  const token = request.cookies.get("phc_token")?.value;
  console.log("AUTH DEBUG: Cookie token present:", !!token);

  if (token) {
    console.log(
      "AUTH DEBUG: Token from cookie:",
      token ? `${token.substring(0, 5)}...` : "NONE"
    );

    try {
      const decoded = await verifyToken(token);
      console.log("AUTH DEBUG: Cookie token verification result:", !!decoded);

      if (decoded && decoded.role === "admin") {
        console.log("AUTH DEBUG: Admin authenticated via cookie");
        return { authenticated: true, user: decoded };
      } else if (decoded) {
        console.log(
          "AUTH DEBUG: User authenticated but not admin. Role:",
          decoded.role
        );
      }
    } catch (error) {
      console.error("AUTH DEBUG: Error verifying token from cookie:", error);
    }
  }

  // Log available cookies
  console.log(
    "AUTH DEBUG: All cookies:",
    Array.from(request.cookies.getAll()).map((c) => c.name)
  );

  // Not authenticated
  console.log("AUTH DEBUG: Authentication failed");
  return { authenticated: false, user: null };
}

// GET /api/articles/[id] - Get a specific article
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    // Special handling for slug-based lookup
    let article;
    if (id.length > 36) {
      // Assume it's a slug if longer than UUID
      article = await ArticleModel.findOne({
        where: { slug: id },
      });
    } else {
      // Otherwise lookup by ID
      article = await ArticleModel.findByPk(id);
    }

    if (!article) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    return NextResponse.json(article);
  } catch (error) {
    console.error(`Error fetching article ${params.id}:`, error);
    return NextResponse.json(
      { error: "Failed to fetch article" },
      { status: 500 }
    );
  }
}

// PUT /api/articles/[id] - Update an article
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication using the helper function
    const authResult = await authenticateRequest(request);
    if (!authResult.authenticated) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const id = params.id;
    const article = await ArticleModel.findByPk(id);

    if (!article) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    const data = await request.json();

    // Validate required fields
    if (!data.title || !data.content || !data.summary || !data.author) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Handle publishing state change
    if (data.isPublished && !article.isPublished) {
      // If article is being published for the first time
      data.publishedDate = new Date();
    } else if (!data.isPublished && article.isPublished) {
      // If article is being unpublished
      data.publishedDate = null;
    }

    // Generate slug from title if title is being updated
    if (data.title && data.title !== article.title) {
      data.slug = data.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
    }

    try {
      // Update the article
      await article.update(data);
      return NextResponse.json(article);
    } catch (updateError: any) {
      console.error("Error during article update:", updateError);
      // Check for unique constraint violation (slug)
      if (updateError.name === "SequelizeUniqueConstraintError") {
        return NextResponse.json(
          { error: "An article with this title already exists" },
          { status: 400 }
        );
      }
      throw updateError;
    }
  } catch (error) {
    console.error(`Error updating article ${params.id}:`, error);
    return NextResponse.json(
      { error: "Failed to update article" },
      { status: 500 }
    );
  }
}

// DELETE /api/articles/[id] - Delete an article
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication using the helper function
    const authResult = await authenticateRequest(request);
    if (!authResult.authenticated) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const id = params.id;
    const article = await ArticleModel.findByPk(id);

    if (!article) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    await article.destroy();

    return NextResponse.json(
      { message: "Article deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error(`Error deleting article ${params.id}:`, error);
    return NextResponse.json(
      { error: "Failed to delete article" },
      { status: 500 }
    );
  }
}
