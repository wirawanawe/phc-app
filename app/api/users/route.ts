import { NextRequest, NextResponse } from "next/server";
import { User } from "@/app/types";

// Mock database - in a real app, this would be your database
export let users: User[] = [
  {
    id: "user_1",
    username: "admin",
    email: "admin@phc.com",
    fullName: "Admin User",
    role: "admin",
    isActive: true,
    lastLogin: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  },
  {
    id: "user_2",
    username: "drsmith",
    email: "jane.smith@phc.com",
    fullName: "Dr. Jane Smith",
    role: "doctor",
    isActive: true,
    lastLogin: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  },
  {
    id: "user_3",
    username: "staffone",
    email: "staff@phc.com",
    fullName: "Staff User",
    role: "staff",
    isActive: true,
    lastLogin: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  },
];

// GET all users
export async function GET() {
  return NextResponse.json(users);
}

// POST create a new user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.username || !body.email || !body.fullName || !body.role) {
      return NextResponse.json(
        { error: "Username, email, full name, and role are required fields" },
        { status: 400 }
      );
    }

    // Check if username or email already exists
    const usernameExists = users.some(
      (user) => user.username === body.username
    );
    const emailExists = users.some((user) => user.email === body.email);

    if (usernameExists) {
      return NextResponse.json(
        { error: "Username already exists" },
        { status: 400 }
      );
    }

    if (emailExists) {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 400 }
      );
    }

    // Create a new user
    const newUser: User = {
      id: "user_" + Date.now(),
      username: body.username,
      email: body.email,
      fullName: body.fullName,
      role: body.role,
      isActive: body.isActive !== undefined ? body.isActive : true,
      lastLogin: body.lastLogin,
      createdAt: new Date().toISOString(),
    };

    // Add to our mock database
    users.push(newUser);

    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }
}
