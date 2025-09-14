import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import dbConnect from "@/lib/dbConnect";
import Restaurant from "@/lib/models/Restaurant";

// GET /api/restaurants/[id] - Получить конкретный ресторан
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(request);
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    await dbConnect();

    const { id: restaurantId } = await params;
    const restaurant = await Restaurant.findById(restaurantId);

    if (!restaurant) {
      return NextResponse.json(
        { error: "Restaurant not found" },
        { status: 404 }
      );
    }

    // Проверяем, что пользователь является владельцем ресторана
    if (restaurant.owner.toString() !== (user as any)._id.toString()) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    return NextResponse.json({ restaurant });
  } catch (error: unknown) {
    console.error("Get restaurant by ID error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// PUT /api/restaurants/[id] - Обновить ресторан
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(request);
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    await dbConnect();

    const { id: restaurantId } = await params;
    const body = await request.json();

    // Получаем ресторан
    const restaurant = await Restaurant.findById(restaurantId);

    if (!restaurant) {
      return NextResponse.json(
        { error: "Restaurant not found" },
        { status: 404 }
      );
    }

    // Проверяем, что пользователь является владельцем ресторана
    if (restaurant.owner.toString() !== (user as any)._id.toString()) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Обновляем ресторан
    const updatedRestaurant = await Restaurant.findByIdAndUpdate(
      restaurantId,
      { $set: body },
      { new: true, runValidators: true }
    );

    return NextResponse.json({
      message: "Restaurant updated successfully",
      restaurant: updatedRestaurant,
    });
  } catch (error: unknown) {
    console.error("Update restaurant error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// DELETE /api/restaurants/[id] - Удалить ресторан
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(request);
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    await dbConnect();

    const { id: restaurantId } = await params;

    // Получаем ресторан
    const restaurant = await Restaurant.findById(restaurantId);

    if (!restaurant) {
      return NextResponse.json(
        { error: "Restaurant not found" },
        { status: 404 }
      );
    }

    // Проверяем, что пользователь является владельцем ресторана
    if (restaurant.owner.toString() !== (user as any)._id.toString()) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Удаляем ресторан
    await Restaurant.findByIdAndDelete(restaurantId);

    return NextResponse.json({
      message: "Restaurant deleted successfully",
    });
  } catch (error: unknown) {
    console.error("Delete restaurant error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
