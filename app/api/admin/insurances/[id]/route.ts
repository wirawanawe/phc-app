import { InsuranceModel } from "@/app/models/Insurance";
import { NextRequest, NextResponse } from "next/server";
import { initializeDatabase } from "@/app/models";

// GET a specific insurance by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Make sure database is initialized
    await initializeDatabase();

    const id = params.id;
    const insurance = await InsuranceModel.findByPk(id);

    if (!insurance) {
      return NextResponse.json(
        { error: "Insurance not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(insurance);
  } catch (error) {
    console.error("Error fetching insurance from database:", error);
    return NextResponse.json(
      { error: "Failed to fetch insurance" },
      { status: 500 }
    );
  }
}

// PUT update an insurance by ID
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Make sure database is initialized
    await initializeDatabase();

    const id = params.id;
    const body = await request.json();

    // Find the insurance
    const insurance = await InsuranceModel.findByPk(id);
    if (!insurance) {
      return NextResponse.json(
        { error: "Insurance not found" },
        { status: 404 }
      );
    }

    // Update insurance with the provided data
    await insurance.update({
      name: body.name !== undefined ? body.name : insurance.name,
      description:
        body.description !== undefined
          ? body.description
          : insurance.description,
      coverage:
        body.coverage !== undefined ? body.coverage : insurance.coverage,
      isActive:
        body.isActive !== undefined ? body.isActive : insurance.isActive,
    });

    return NextResponse.json(insurance);
  } catch (error) {
    console.error("Error updating insurance in database:", error);
    return NextResponse.json(
      { error: "Failed to update insurance" },
      { status: 500 }
    );
  }
}

// DELETE an insurance by ID
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Make sure database is initialized
    await initializeDatabase();

    const id = params.id;

    // Find the insurance
    const insurance = await InsuranceModel.findByPk(id);
    if (!insurance) {
      return NextResponse.json(
        { error: "Insurance not found" },
        { status: 404 }
      );
    }

    // Delete the insurance
    await insurance.destroy();

    return NextResponse.json({ message: "Insurance deleted successfully" });
  } catch (error) {
    console.error("Error deleting insurance from database:", error);
    return NextResponse.json(
      { error: "Failed to delete insurance" },
      { status: 500 }
    );
  }
}
