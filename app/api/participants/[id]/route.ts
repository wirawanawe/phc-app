import { NextRequest, NextResponse } from "next/server";
import { ParticipantModel, UserModel, initializeDatabase } from "@/app/models";
import sequelize from "@/app/config/db.config";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Make sure database is initialized
    await initializeDatabase();

    const { id } = params;
    const participant = await ParticipantModel.findByPk(id);

    if (!participant) {
      return NextResponse.json(
        { error: "Participant not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(participant);
  } catch (error) {
    console.error("Error fetching participant:", error);
    return NextResponse.json(
      { error: "Failed to fetch participant" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Make sure database is initialized
    await initializeDatabase();

    const { id } = params;
    const body = await request.json();

    // Find the participant
    const participant = await ParticipantModel.findByPk(id);
    if (!participant) {
      return NextResponse.json(
        { error: "Participant not found" },
        { status: 404 }
      );
    }

    // Validate required fields
    if (!body.name || !body.email) {
      return NextResponse.json(
        { error: "Name and email are required fields" },
        { status: 400 }
      );
    }

    // Update the participant
    await participant.update({
      name: body.name,
      email: body.email,
      phone: body.phone || null,
      dateOfBirth: body.dateOfBirth || null,
      address: body.address || null,
      identityNumber: body.identityNumber || null,
      insuranceId: body.insuranceId || null,
      insuranceNumber: body.insuranceNumber || null,
    });

    return NextResponse.json(participant);
  } catch (error) {
    console.error("Error updating participant:", error);
    return NextResponse.json(
      { error: "Failed to update participant" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Make sure database is initialized
    await initializeDatabase();

    const { id } = params;

    // Find the participant
    const participant = await ParticipantModel.findByPk(id);
    if (!participant) {
      return NextResponse.json(
        { error: "Participant not found" },
        { status: 404 }
      );
    }

    // Start a transaction to ensure both records are deleted
    const transaction = await sequelize.transaction();

    try {
      // Delete the associated user (if it exists)
      const user = await UserModel.findByPk(id);
      if (user) {
        // Check if this is the last admin user
        if (user.role === "admin") {
          const adminCount = await UserModel.count({
            where: { role: "admin" },
          });

          if (adminCount <= 1) {
            await transaction.rollback();
            return NextResponse.json(
              {
                error: "Cannot delete the last admin user in the system.",
              },
              { status: 400 }
            );
          }
        }

        await user.destroy({ transaction });
      }

      // Delete the participant
      await participant.destroy({ transaction });

      // Commit the transaction
      await transaction.commit();

      return NextResponse.json(
        {
          message: "Participant and associated user deleted successfully",
        },
        { status: 200 }
      );
    } catch (error) {
      // Rollback the transaction if something fails
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    console.error("Error deleting participant:", error);
    return NextResponse.json(
      { error: "Failed to delete participant" },
      { status: 500 }
    );
  }
}
