import { NextRequest, NextResponse } from "next/server";
import { ProgramCategoryModel, HealthProgramModel } from "@/app/models";

// GET a single program category by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    // Find the category by ID
    const category = await ProgramCategoryModel.findByPk(id);

    if (!category) {
      return NextResponse.json(
        { error: "Program category not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(category);
  } catch (error) {
    console.error("Error fetching program category:", error);
    return NextResponse.json(
      { error: "Failed to fetch program category" },
      { status: 500 }
    );
  }
}

// PUT update an existing program category
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const body = await request.json();

    // Find the category by ID
    const category = await ProgramCategoryModel.findByPk(id);

    if (!category) {
      return NextResponse.json(
        { error: "Program category not found" },
        { status: 404 }
      );
    }

    // If name is changing, check if the new name already exists
    if (body.name && body.name !== category.name) {
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
    }

    // Update the category
    await category.update(body);

    return NextResponse.json(category);
  } catch (error) {
    console.error("Error updating program category:", error);
    return NextResponse.json(
      { error: "Failed to update program category" },
      { status: 500 }
    );
  }
}

// DELETE a program category
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    // Find the category by ID
    const category = await ProgramCategoryModel.findByPk(id);

    if (!category) {
      return NextResponse.json(
        { error: "Program category not found" },
        { status: 404 }
      );
    }

    // Check if there are programs using this category
    const programsCount = await HealthProgramModel.count({
      where: {
        categoryId: id,
      },
    });

    if (programsCount > 0) {
      return NextResponse.json(
        {
          error:
            "Cannot delete this category because it is used by one or more programs",
          programsCount,
        },
        { status: 400 }
      );
    }

    // Delete the category
    await category.destroy();

    return NextResponse.json(
      { message: "Program category deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting program category:", error);
    return NextResponse.json(
      { error: "Failed to delete program category" },
      { status: 500 }
    );
  }
}
