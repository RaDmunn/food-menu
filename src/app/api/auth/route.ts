import { NextRequest, NextResponse } from "next/server";
import { authenticateUser, createUser } from "@/lib/auth";
import { UserRole } from "@/lib/models/User";

// POST /api/auth - User authentication and registration
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, email, password, name, phone, role } = body;

    if (action === "login") {
      // User login
      if (!email || !password) {
        return NextResponse.json(
          { error: "Email and password are required" },
          { status: 400 }
        );
      }

      const result = await authenticateUser(email, password);
      if (!result) {
        return NextResponse.json(
          { error: "Invalid credentials" },
          { status: 401 }
        );
      }

      return NextResponse.json({
        message: "Login successful",
        user: {
          id: result.user._id,
          name: result.user.name,
          email: result.user.email,
          role: result.user.role,
          status: result.user.status,
        },
        token: result.token,
      });
    } else if (action === "register") {
      // User registration
      if (!name || !email || !password) {
        return NextResponse.json(
          { error: "Name, email and password are required" },
          { status: 400 }
        );
      }

      try {
        const user = await createUser({
          name,
          email,
          password,
          phone,
          role: role || UserRole.RESTAURANT_OWNER,
        });

        // Authenticate the new user to get token
        const result = await authenticateUser(email, password);

        if (!result) {
          return NextResponse.json(
            { error: "Registration successful but login failed" },
            { status: 500 }
          );
        }

        return NextResponse.json(
          {
            message: "Registration successful",
            user: {
              id: result.user._id,
              name: result.user.name,
              email: result.user.email,
              role: result.user.role,
              status: result.user.status,
            },
            token: result.token,
          },
          { status: 201 }
        );
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "";
        if (errorMessage.includes("already exists")) {
          return NextResponse.json(
            { error: "User with this email already exists" },
            { status: 409 }
          );
        }
        throw error;
      }
    } else {
      return NextResponse.json(
        { error: 'Invalid action. Use "login" or "register"' },
        { status: 400 }
      );
    }
  } catch (error: unknown) {
    console.error("Auth API error:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
