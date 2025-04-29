import { NextRequest, NextResponse } from "next/server";
import { sequelize } from "@/app/models";
import { QueryTypes } from "sequelize";

export async function GET(req: NextRequest) {
  try {
    // Get enrollment counts for each health program
    const enrollmentCounts = await sequelize.query(
      `
      SELECT 
        pe.healthProgramId as programId, 
        COUNT(DISTINCT pe.participantId) as count
      FROM 
        participant_enrollments pe
      JOIN 
        health_programs hp ON pe.healthProgramId = hp.id
      WHERE 
        pe.status = 'active' 
        AND hp.status = 'active'
        AND (hp.endDate IS NULL OR hp.endDate >= CURDATE())
      GROUP BY 
        pe.healthProgramId
      `,
      {
        type: QueryTypes.SELECT,
      }
    );

    return NextResponse.json(enrollmentCounts);
  } catch (error) {
    console.error("Error fetching enrollment counts:", error);
    return NextResponse.json(
      { error: "Failed to fetch enrollment counts" },
      { status: 500 }
    );
  }
}
