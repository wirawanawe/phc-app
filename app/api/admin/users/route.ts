import { NextRequest, NextResponse } from "next/server";
import { UserModel, initializeDatabase } from "@/app/models";

// GET all users from the MySQL database
export async function GET() {
  try {
    // Make sure database is initialized
    await initializeDatabase();

    const users = await UserModel.findAll({
      order: [["createdAt", "DESC"]],
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error("Error fetching users from database:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

// POST create a new user in the MySQL database
export async function POST(request: NextRequest) {
  try {
    // Make sure database is initialized
    await initializeDatabase();

    const body = await request.json();

    // Validate required fields
    if (!body.username || !body.email || !body.fullName || !body.password) {
      return NextResponse.json(
        {
          error: "Username, email, full name, and password are required fields",
        },
        { status: 400 }
      );
    }

    // Check if username already exists
    const existingUsername = await UserModel.findOne({
      where: { username: body.username },
    });
    if (existingUsername) {
      return NextResponse.json(
        { error: "Username already in use" },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingEmail = await UserModel.findOne({
      where: { email: body.email },
    });
    if (existingEmail) {
      return NextResponse.json(
        { error: "Email already in use" },
        { status: 400 }
      );
    }

    // Validate role
    const validRoles = ["admin", "staff", "doctor", "participant"];
    let role = body.role || "participant";

    // Jika database membatasi panjang string, kita bisa menggunakan singkatan
    // atau nilai yang lebih pendek untuk pastikan tidak melebihi batas karakter
    if (role === "participant") {
      role = "part"; // Gunakan singkatan yang lebih pendek
    }

    if (!validRoles.includes(body.role || "participant")) {
      return NextResponse.json(
        {
          error:
            "Invalid role. Role must be one of: admin, staff, doctor, participant",
        },
        { status: 400 }
      );
    }

    // Create user in database
    const newUser = await UserModel.create({
      username: body.username,
      email: body.email,
      fullName: body.fullName,
      password: body.password,
      role: role,
      isActive: body.isActive !== undefined ? body.isActive : true,
    });

    // Remove password from response
    const userData = newUser.get({ plain: true });
    delete userData.password;

    return NextResponse.json(userData, { status: 201 });
  } catch (error) {
    console.error("Error creating user in database:", error);
    return NextResponse.json(
      {
        error: "Failed to create user",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
