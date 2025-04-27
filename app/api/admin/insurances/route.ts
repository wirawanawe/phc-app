import { InsuranceModel } from "@/app/models/Insurance";
import { NextRequest, NextResponse } from "next/server";
import { initializeDatabase } from "@/app/models";

// GET all insurances from the MySQL database
export async function GET() {
  try {
    // Make sure database is initialized
    await initializeDatabase();

    const insurances = await InsuranceModel.findAll({
      order: [["createdAt", "DESC"]],
    });

    return NextResponse.json(insurances);
  } catch (error) {
    console.error("Error fetching insurances from database:", error);
    return NextResponse.json(
      { error: "Failed to fetch insurances" },
      { status: 500 }
    );
  }
}

// POST create a new insurance in the MySQL database
export async function POST(request: NextRequest) {
  try {
    // Make sure database is initialized
    await initializeDatabase();

    const body = await request.json();

    // Validate required fields
    if (!body.name) {
      return NextResponse.json(
        { error: "Insurance name is a required field" },
        { status: 400 }
      );
    }

    // Create insurance in database
    const newInsurance = await InsuranceModel.create({
      name: body.name,
      description: body.description || "",
      coverage: body.coverage || "",
      isActive: body.isActive !== undefined ? body.isActive : true,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json(newInsurance, { status: 201 });
  } catch (error) {
    console.error("Error creating insurance in database:", error);
    return NextResponse.json(
      { error: "Failed to create insurance" },
      { status: 500 }
    );
  }
}
