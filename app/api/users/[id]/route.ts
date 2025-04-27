import { NextRequest, NextResponse } from "next/server";
import { User } from "@/app/types";

// Import from the main route file where the array is exported
import { users } from "../route";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  const user = users.find((u: User) => u.id === id);

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json(user);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const body = await request.json();

    // Find the user
    const userIndex = users.findIndex((u: User) => u.id === id);
    if (userIndex === -1) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Validate required fields
    if (!body.username || !body.email || !body.fullName || !body.role) {
      return NextResponse.json(
        { error: "Username, email, full name, and role are required fields" },
        { status: 400 }
      );
    }

    // Check if username is being changed and already exists
    if (
      body.username !== users[userIndex].username &&
      users.some((u) => u.username === body.username)
    ) {
      return NextResponse.json(
        { error: "Username already exists" },
        { status: 400 }
      );
    }

    // Check if email is being changed and already exists
    if (
      body.email !== users[userIndex].email &&
      users.some((u) => u.email === body.email)
    ) {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 400 }
      );
    }

    // Update the user (keeping the id and createdAt the same)
    const updatedUser: User = {
      ...users[userIndex],
      username: body.username,
      email: body.email,
      fullName: body.fullName,
      role: body.role,
      isActive:
        body.isActive !== undefined ? body.isActive : users[userIndex].isActive,
      lastLogin: body.lastLogin || users[userIndex].lastLogin,
      // Don't update id or createdAt
    };

    users[userIndex] = updatedUser;

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    // Check if user exists
    const userIndex = users.findIndex((u: User) => u.id === id);
    if (userIndex === -1) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Remove the user
    users.splice(userIndex, 1);

    return NextResponse.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    );
  }
}
