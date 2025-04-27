import { InsuranceModel } from "@/app/models/Insurance";
import { NextRequest, NextResponse } from "next/server";
import { initializeDatabase } from "@/app/models";

// GET all active insurances
export async function GET() {
  try {
    // Make sure database is initialized
    await initializeDatabase();

    // Only return active insurances
    const insurances = await InsuranceModel.findAll({
      where: { isActive: true },
      order: [["name", "ASC"]],
      attributes: ["id", "name", "description"], // Only return necessary fields
    });

    return NextResponse.json(insurances);
  } catch (error) {
    console.error("Error fetching insurances:", error);
    return NextResponse.json(
      { error: "Failed to fetch insurances" },
      { status: 500 }
    );
  }
}
