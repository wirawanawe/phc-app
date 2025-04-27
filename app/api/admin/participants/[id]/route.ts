import { NextRequest, NextResponse } from "next/server";
import { ParticipantModel, UserModel, initializeDatabase } from "@/app/models";
import { Op } from "sequelize";
import sequelize from "@/app/config/db.config";

// GET a specific participant by ID
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

// PUT update a participant
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Make sure database is initialized
    await initializeDatabase();

    const id = params.id;
    const body = await request.json();

    // Find the participant
    const participant = await ParticipantModel.findByPk(id);
    if (!participant) {
      return NextResponse.json(
        { error: "Participant not found" },
        { status: 404 }
      );
    }

    // Check if email is already used by another participant (if being changed)
    if (body.email && body.email !== participant.email) {
      const existingEmail = await ParticipantModel.findOne({
        where: {
          email: body.email,
          id: { [Op.ne]: id }, // Exclude current participant
        },
      });

      if (existingEmail) {
        return NextResponse.json(
          { error: "Email already in use by another participant" },
          { status: 400 }
        );
      }
    }

    // Check if phone number is already used by another participant
    if (body.phone && body.phone !== participant.phone) {
      const existingPhone = await ParticipantModel.findOne({
        where: {
          phone: body.phone,
          id: { [Op.ne]: id }, // Exclude current participant
        },
      });

      if (existingPhone) {
        return NextResponse.json(
          { error: "Phone number already in use by another participant" },
          { status: 400 }
        );
      }
    }

    // Check if identity number is already used by another participant
    if (
      body.identityNumber &&
      body.identityNumber !== participant.identityNumber
    ) {
      const existingIdentity = await ParticipantModel.findOne({
        where: {
          identityNumber: body.identityNumber,
          id: { [Op.ne]: id }, // Exclude current participant
        },
      });

      if (existingIdentity) {
        return NextResponse.json(
          { error: "Identity number already in use by another participant" },
          { status: 400 }
        );
      }
    }

    // Update participant with the provided data
    await participant.update({
      name: body.name !== undefined ? body.name : participant.name,
      email: body.email !== undefined ? body.email : participant.email,
      phone: body.phone !== undefined ? body.phone : participant.phone,
      dateOfBirth:
        body.dateOfBirth !== undefined
          ? body.dateOfBirth
          : participant.dateOfBirth,
      address: body.address !== undefined ? body.address : participant.address,
      identityNumber:
        body.identityNumber !== undefined
          ? body.identityNumber
          : participant.identityNumber,
      insuranceId:
        body.insuranceId !== undefined
          ? body.insuranceId
          : participant.insuranceId,
      insuranceNumber:
        body.insuranceNumber !== undefined
          ? body.insuranceNumber
          : participant.insuranceNumber,
    });

    return NextResponse.json(participant);
  } catch (error) {
    console.error("Error updating participant in database:", error);
    return NextResponse.json(
      { error: "Failed to update participant" },
      { status: 500 }
    );
  }
}

// DELETE a participant
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
