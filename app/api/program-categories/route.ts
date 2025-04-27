import { NextRequest, NextResponse } from "next/server";
import { ProgramCategoryModel, initializeDatabase } from "@/app/models";
import { Op } from "sequelize";

// GET all program categories
export async function GET(request: NextRequest) {
  try {
    // Initialize database
    await initializeDatabase();

    // Get query parameters
    const url = new URL(request.url);
    const isActive = url.searchParams.get("isActive");

    // Build query based on provided filters
    const query: any = {};
    if (isActive === "true") {
      query.isActive = true;
    } else if (isActive === "false") {
      query.isActive = false;
    }

    // Get program categories
    const categories = await ProgramCategoryModel.findAll({
      where: query,
      attributes: ["id", "name", "description", "color", "isActive"],
      order: [["name", "ASC"]],
    });

    // Clean up the data before sending it
    const sanitizedData = categories.map((category) => {
      // Use type assertion to handle the dynamic properties
      const plainCategory = category.get({ plain: true }) as any;

      return {
        id: plainCategory.id || "",
        name: plainCategory.name || "Uncategorized",
        description: plainCategory.description || "",
        color: plainCategory.color || "#E32345",
        isActive:
          plainCategory.isActive !== undefined ? plainCategory.isActive : true,
      };
    });

    return NextResponse.json(sanitizedData);
  } catch (error) {
    console.error("Error fetching program categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch program categories" },
      { status: 500 }
    );
  }
}

// POST create a new program category
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.name) {
      return NextResponse.json(
        { error: "Category name is required" },
        { status: 400 }
      );
    }

    // Check if a category with the same name exists
    const existingCategory = await ProgramCategoryModel.findOne({
      where: {
        name: body.name,
      },
    });

    if (existingCategory) {
      return NextResponse.json(
        { error: "A category with this name already exists" },
        { status: 400 }
      );
    }

    // Create a new program category
    const newCategory = await ProgramCategoryModel.create({
      ...body,
      isActive: body.isActive !== undefined ? body.isActive : true,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json(newCategory, { status: 201 });
  } catch (error) {
    console.error("Error creating program category:", error);
    return NextResponse.json(
      { error: "Failed to create program category" },
      { status: 500 }
    );
  }
}
