import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import dbConnect from "@/lib/dbConnect";
import User, { UserStatus } from "@/lib/models/User";

// PUT /api/admin/users/[id]/status - Обновить статус пользователя (только для админов)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();

    // Проверяем, что пользователь - админ
    const adminUser = await requireAdmin(request);
    if (!adminUser) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    // Валидация статуса
    const validStatuses = Object.values(UserStatus);
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        {
          error: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // Находим пользователя
    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Проверяем, что админ не пытается изменить статус самого себя
    if ((user._id as any).toString() === (adminUser._id as any).toString()) {
      return NextResponse.json(
        { error: "Cannot change your own status" },
        { status: 400 }
      );
    }

    // Обновляем статус
    user.status = status;
    await user.save();

    return NextResponse.json({
      message: "User status updated successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        status: user.status,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error: unknown) {
    console.error("Update user status error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
