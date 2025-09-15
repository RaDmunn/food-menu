import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import dbConnect from "@/lib/dbConnect";
import Menu from "@/lib/models/Menu";
import Restaurant from "@/lib/models/Restaurant";

// GET /api/menu/[id] - Получить конкретное меню по ID
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

    const { id: menuId } = await params;

    // Получаем меню
    const menu = await Menu.findById(menuId).populate(
      "restaurant",
      "name owner"
    );

    if (!menu) {
      return NextResponse.json({ error: "Menu not found" }, { status: 404 });
    }

    // Проверяем, что пользователь является владельцем ресторана
    if (
      (menu.restaurant as any).owner.toString() !== (user as any)._id.toString()
    ) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    return NextResponse.json({ menu });
  } catch (error: unknown) {
    console.error("Get menu by ID error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// PUT /api/menu/[id] - Обновить меню
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

    const { id: menuId } = await params;
    const body = await request.json();

    // Получаем меню
    const menu = await Menu.findById(menuId).populate("restaurant", "owner");

    if (!menu) {
      return NextResponse.json({ error: "Menu not found" }, { status: 404 });
    }

    // Проверяем, что пользователь является владельцем ресторана
    if (
      (menu.restaurant as any).owner.toString() !== (user as any)._id.toString()
    ) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Обновляем меню
    const updatedMenu = await Menu.findByIdAndUpdate(
      menuId,
      { $set: body },
      { new: true, runValidators: true }
    ).populate("restaurant", "name");

    return NextResponse.json({
      message: "Menu updated successfully",
      menu: updatedMenu,
    });
  } catch (error: unknown) {
    console.error("Update menu error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// DELETE /api/menu/[id] - Удалить меню
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

    const { id: menuId } = await params;

    // Получаем меню
    const menu = await Menu.findById(menuId).populate("restaurant", "owner");

    if (!menu) {
      return NextResponse.json({ error: "Menu not found" }, { status: 404 });
    }

    // Проверяем, что пользователь является владельцем ресторана
    if (
      (menu.restaurant as any).owner.toString() !== (user as any)._id.toString()
    ) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Удаляем меню
    await Menu.findByIdAndDelete(menuId);

    return NextResponse.json({
      message: "Menu deleted successfully",
    });
  } catch (error: unknown) {
    console.error("Delete menu error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
