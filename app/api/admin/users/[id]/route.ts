import { NextRequest, NextResponse } from "next/server";
import { UserModel, initializeDatabase } from "@/app/models";
import { Op } from "sequelize";

// GET a specific user by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Make sure database is initialized
    await initializeDatabase();

    const { id } = params;
    const user = await UserModel.findByPk(id);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 }
    );
  }
}

// PUT update a user
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Make sure database is initialized
    await initializeDatabase();

    const { id } = params;
    const body = await request.json();

    // Find the user
    const user = await UserModel.findByPk(id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if username is being changed and already exists
    if (body.username && body.username !== user.username) {
      const existingUsername = await UserModel.findOne({
        where: {
          username: body.username,
          id: { [Op.ne]: id }, // Exclude current user
        },
      });

      if (existingUsername) {
        return NextResponse.json(
          { error: "Username already in use by another user" },
          { status: 400 }
        );
      }
    }

    // Check if email is being changed and already exists
    if (body.email && body.email !== user.email) {
      const existingEmail = await UserModel.findOne({
        where: {
          email: body.email,
          id: { [Op.ne]: id }, // Exclude current user
        },
      });

      if (existingEmail) {
        return NextResponse.json(
          { error: "Email already in use by another user" },
          { status: 400 }
        );
      }
    }

    // Update the user
    await user.update({
      username: body.username,
      email: body.email,
      fullName: body.fullName,
      role: body.role,
      isActive: body.isActive,
      lastLogin: body.lastLogin,
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}

// DELETE a user
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Make sure database is initialized
    await initializeDatabase();

    const { id } = params;

    // Find the user
    const user = await UserModel.findByPk(id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if this is the last user in the database
    const userCount = await UserModel.count();
    if (userCount <= 1) {
      return NextResponse.json(
        {
          error:
            "Cannot delete the last user in the system. At least one user must remain.",
          message:
            "A new admin user will be created automatically if all users are deleted.",
        },
        { status: 400 }
      );
    }

    // Delete the user
    await user.destroy();

    return NextResponse.json(
      { message: "User deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    );
  }
}
