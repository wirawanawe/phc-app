import { InsuranceModel } from "@/app/models/Insurance";
import { NextRequest, NextResponse } from "next/server";
import { initializeDatabase } from "@/app/models";

// GET a specific insurance by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Make sure database is initialized
    await initializeDatabase();

    // Properly await the params
    const { id } = await params;
    const insurance = await InsuranceModel.findByPk(id);

    if (!insurance) {
      return NextResponse.json(
        { error: "Insurance not found" },
        { status: 404 }
      );
    }

    // Return only needed fields for public API
    return NextResponse.json({
      id: insurance.id,
      name: insurance.name,
      description: insurance.description,
      coverage: insurance.coverage,
    });
  } catch (error) {
    console.error("Error fetching insurance:", error);
    return NextResponse.json(
      { error: "Failed to fetch insurance" },
      { status: 500 }
    );
  }
}
