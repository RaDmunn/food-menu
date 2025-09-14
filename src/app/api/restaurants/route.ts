import { NextRequest, NextResponse } from "next/server";
import {
  requireAuth,
  requireAdminOrOwner,
  canAccessRestaurant,
} from "@/lib/auth";
import dbConnect from "@/lib/dbConnect";
import Restaurant from "@/lib/models/Restaurant";
import { RestaurantStatus } from "@/lib/types";
import User, { UserRole } from "@/lib/models/User";
import Menu from "@/lib/models/Menu";

// GET /api/restaurants - Получить список ресторанов
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const city = searchParams.get("city");
    const cuisine = searchParams.get("cuisine");
    const status = searchParams.get("status");
    const ownerId = searchParams.get("owner");

    const query: Record<string, unknown> = {};

    // Фильтры
    if (city) {
      query["address.city"] = new RegExp(city, "i");
    }
    if (cuisine) {
      query.cuisineType = cuisine;
    }
    if (status) {
      query.status = status;
    } else {
      // По умолчанию показываем только активные рестораны
      query.status = RestaurantStatus.ACTIVE;
    }
    if (ownerId) {
      query.owner = ownerId;
    }

    const restaurants = await Restaurant.find(query)
      .populate("owner", "name email")
      .sort({ createdAt: -1 });

    return NextResponse.json({
      restaurants,
      count: restaurants.length,
    });
  } catch (error: unknown) {
    console.error("Get restaurants error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// POST /api/restaurants - Создать новый ресторан
export async function POST(request: NextRequest) {
  try {
    const user = await requireAdminOrOwner(request);
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    await dbConnect();

    const body = await request.json();
    const {
      name,
      description,
      address,
      contact,
      cuisineType,
      workingHours,
      priceRange,
      features,
    } = body;

    // Валидация обязательных полей
    if (!name || !address || !contact || !cuisineType) {
      return NextResponse.json(
        { error: "Name, address, contact, and cuisine type are required" },
        { status: 400 }
      );
    }

    // Создаем ресторан
    const restaurant = new Restaurant({
      name,
      description,
      owner: user._id,
      address,
      contact,
      cuisineType,
      workingHours: workingHours || [],
      priceRange,
      features: features || [],
      status:
        user.role === UserRole.ADMIN
          ? RestaurantStatus.ACTIVE
          : RestaurantStatus.PENDING,
    });

    const savedRestaurant = await restaurant.save();

    // Создаем пустое меню для ресторана
    const menu = new Menu({
      restaurant: savedRestaurant._id,
      currency: body.priceRange?.currency || "EUR",
      categories: [],
      isActive: true,
    });
    await menu.save();

    // Добавляем ресторан к списку ресторанов владельца
    if (user.role === UserRole.RESTAURANT_OWNER) {
      await User.findByIdAndUpdate(user._id, {
        $push: { restaurants: savedRestaurant._id },
      });
    }

    return NextResponse.json(
      {
        message: "Restaurant created successfully",
        restaurant: savedRestaurant,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Create restaurant error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
