import { NextRequest, NextResponse } from "next/server";
import {
  HealthProgramModel,
  ProgramCategoryModel,
  initializeDatabase,
} from "@/app/models";
import { verifyToken, getRoleFromToken } from "@/app/utils/auth";

// GET all health programs
export async function GET(request: NextRequest) {
  try {
    // Get the auth token from cookies
    const token = request.cookies.get("phc_token")?.value;

    if (token) {
      // Verify token and check role
      const userRole = getRoleFromToken(token);

      // Block admin users from accessing health program data
      if (userRole === "admin") {
        console.log(
          "Admin user attempted to access health program data - access denied"
        );
        return NextResponse.json(
          {
            error:
              "Admin users are not authorized to access health program data",
          },
          { status: 403 }
        );
      }
    }

    // Initialize database
    const dbInitialized = await initializeDatabase();

    if (!dbInitialized) {
      throw new Error("Failed to initialize database connection");
    }

    // Get health programs with categories
    const healthPrograms = await HealthProgramModel.findAll({
      include: [
        {
          model: ProgramCategoryModel,
          as: "category",
          attributes: ["id", "name", "description", "color"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    // Clean up the data before sending it
    const sanitizedData = healthPrograms.map((program) => {
      // Use type assertion to handle the dynamic properties
      const plainProgram = program.get({ plain: true }) as any;

      // Make sure category is properly formatted if it exists
      if (plainProgram.category) {
        return {
          ...plainProgram,
          category: {
            id: plainProgram.category.id || "",
            name: plainProgram.category.name || "Uncategorized",
            description: plainProgram.category.description || "",
            color: plainProgram.category.color || "#E32345",
          },
        };
      }

      return plainProgram;
    });

    return NextResponse.json(sanitizedData);
  } catch (error) {
    console.error("Error fetching health programs:", error);

    // Provide more specific error messages
    let errorMessage = "Failed to fetch health programs";
    let statusCode = 500;

    if (error instanceof Error) {
      errorMessage = `${errorMessage}: ${error.message}`;

      // Check for specific database connection errors
      if (error.message.includes("connect")) {
        errorMessage =
          "Database connection failed. Please check your database configuration.";
      } else if (
        error.message.includes("relation") ||
        error.message.includes("table")
      ) {
        errorMessage =
          "Database schema issue. Tables may not exist or have incorrect structure.";
      }
    }

    return NextResponse.json({ error: errorMessage }, { status: statusCode });
  }
}

// POST create a new health program
export async function POST(request: NextRequest) {
  try {
    // Initialize database
    await initializeDatabase();

    const body = await request.json();

    // Validate required fields
    if (!body.name || !body.description || !body.startDate) {
      return NextResponse.json(
        { error: "Name, description, and start date are required fields" },
        { status: 400 }
      );
    }

    // If categoryId is provided, verify that the category exists
    if (body.categoryId) {
      const categoryExists = await ProgramCategoryModel.findByPk(
        body.categoryId
      );
      if (!categoryExists) {
        return NextResponse.json(
          { error: "The specified category does not exist" },
          { status: 400 }
        );
      }
    }

    // Create a new health program
    const newProgram = await HealthProgramModel.create({
      ...body,
      status: body.status || "active",
      createdAt: new Date().toISOString(),
    });

    // Get the created program with category
    const programWithCategory = await HealthProgramModel.findByPk(
      newProgram.id,
      {
        include: [
          {
            model: ProgramCategoryModel,
            as: "category",
            attributes: ["id", "name", "description", "color"],
          },
        ],
      }
    );

    return NextResponse.json(programWithCategory, { status: 201 });
  } catch (error) {
    console.error("Error creating health program:", error);
    return NextResponse.json(
      { error: "Failed to create health program" },
      { status: 500 }
    );
  }
}
