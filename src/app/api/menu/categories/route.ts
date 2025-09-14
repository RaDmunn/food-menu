import { NextRequest, NextResponse } from "next/server";
import { requireAuth, canAccessRestaurant } from "@/lib/auth";
import dbConnect from "@/lib/dbConnect";
import Menu, { IMenuCategory } from "@/lib/models/Menu";

// GET /api/menu/categories - Get all categories for a restaurant
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const restaurantId = searchParams.get("restaurant");

    if (!restaurantId) {
      return NextResponse.json(
        { error: "Restaurant ID is required" },
        { status: 400 }
      );
    }

    const menu = await Menu.findOne({ restaurant: restaurantId });

    if (!menu) {
      return NextResponse.json({
        categories: [],
        count: 0,
      });
    }

    const categories = menu.categories
      .filter((cat: IMenuCategory) => cat.isActive)
      .map((cat: IMenuCategory) => ({
        name: cat.name,
        description: cat.description,
        itemCount: cat.items.length,
        sortOrder: cat.sortOrder,
      }))
      .sort((a: { sortOrder?: number }, b: { sortOrder?: number }) => (a.sortOrder || 0) - (b.sortOrder || 0));

    return NextResponse.json({
      categories,
      count: categories.length,
    });
  } catch (error: unknown) {
    console.error("Get categories error:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

// POST /api/menu/categories - Add a new category to menu
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
    const { restaurantId, categoryName, description, sortOrder } = body;

    if (!restaurantId || !categoryName) {
      return NextResponse.json(
        { error: "Restaurant ID and category name are required" },
        { status: 400 }
      );
    }

    // Check if user has access to this restaurant
    const hasAccess = await canAccessRestaurant(user, restaurantId);
    if (!hasAccess) {
      return NextResponse.json(
        { error: "Access denied to this restaurant" },
        { status: 403 }
      );
    }

    // Find or create menu
    let menu = await Menu.findOne({ restaurant: restaurantId });

    if (!menu) {
      menu = new Menu({
        restaurant: restaurantId,
        currency: "EUR",
        categories: [],
        isActive: true,
      });
    }

    // Check if category already exists
    const existingCategory = menu.categories.find(
      (cat: IMenuCategory) =>
        cat.name.toLowerCase() === categoryName.toLowerCase()
    );

    if (existingCategory) {
      return NextResponse.json(
        { error: "Category already exists" },
        { status: 400 }
      );
    }

    // Add new category
    menu.categories.push({
      name: categoryName,
      description: description || "",
      items: [],
      isActive: true,
      sortOrder: sortOrder || menu.categories.length,
    });

    await menu.save();

    return NextResponse.json(
      {
        message: "Category added successfully",
        category: menu.categories[menu.categories.length - 1],
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Create category error:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
