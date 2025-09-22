import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import dbConnect from "@/lib/dbConnect";
import Menu from "@/lib/models/Menu";
import Restaurant from "@/lib/models/Restaurant";

// POST /api/menu/create - Создать новое меню
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    await dbConnect();

    const body = await request.json();
    console.log("Received menu data:", body);

    const { restaurantId, name, description, currency, isActive = true } = body;

    // Валидация обязательных полей
    if (!restaurantId || !name) {
      return NextResponse.json(
        { error: "Restaurant ID and menu name are required" },
        { status: 400 }
      );
    }

    // Проверяем, что ресторан принадлежит пользователю
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return NextResponse.json(
        { error: "Restaurant not found" },
        { status: 404 }
      );
    }

    if (restaurant.owner.toString() !== (user as any)._id.toString()) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Проверяем, нет ли уже меню с таким именем для этого ресторана
    const existingMenu = await Menu.findOne({
      restaurant: restaurantId,
      name: name,
    });

    if (existingMenu) {
      return NextResponse.json(
        { error: "Menu with this name already exists for this restaurant" },
        { status: 400 }
      );
    }

    // Создаем меню
    const menu = new Menu({
      restaurant: restaurantId,
      name,
      description: description || "",
      currency: currency || "EUR",
      sections: [],
      isActive,
    });

    const savedMenu = await menu.save();

    // Получаем меню с populate для restaurant
    const populatedMenu = await Menu.findById(savedMenu._id).populate(
      "restaurant",
      "name"
    );

    return NextResponse.json(
      {
        message: "Menu created successfully",
        menu: populatedMenu,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Create menu error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
