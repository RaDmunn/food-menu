import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import dbConnect from "@/lib/dbConnect";
import Restaurant from "@/lib/models/Restaurant";

// PUT /api/admin/restaurants/[id]/status - Обновить статус ресторана (только для админов)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();

    // Проверяем, что пользователь - админ
    const user = await requireAdmin(request);
    if (!user) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    // Валидация статуса
    const validStatuses = ["pending", "active", "inactive", "suspended"];
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        {
          error:
            "Invalid status. Must be one of: pending, active, inactive, suspended",
        },
        { status: 400 }
      );
    }

    // Находим ресторан
    const restaurant = await Restaurant.findById(id);
    if (!restaurant) {
      return NextResponse.json(
        { error: "Restaurant not found" },
        { status: 404 }
      );
    }

    // Обновляем статус
    restaurant.status = status;
    await restaurant.save();

    return NextResponse.json({
      message: "Restaurant status updated successfully",
      restaurant: {
        _id: restaurant._id,
        name: restaurant.name,
        status: restaurant.status,
        updatedAt: restaurant.updatedAt,
      },
    });
  } catch (error: unknown) {
    console.error("Update restaurant status error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
