import { NextRequest, NextResponse } from "next/server";
import { requireAuth, canAccessRestaurant } from "@/lib/auth";
import dbConnect from "@/lib/dbConnect";
import Menu, { MenuItemStatus } from "@/lib/models/Menu";
import Restaurant from "@/lib/models/Restaurant";

// GET /api/menu - Get complete menu for restaurant or all menus for user
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const restaurantId = searchParams.get("restaurant");
    const menuName = searchParams.get("menu"); // New parameter to get specific menu by name
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const myMenus = searchParams.get("my"); // New parameter to get all user's menus

    // If requesting user's menus, require authentication
    if (myMenus === "true") {
      const user = await requireAuth(request);
      if (!user) {
        return NextResponse.json(
          { error: "Authentication required" },
          { status: 401 }
        );
      }

      // Get all restaurants owned by the user
      const restaurants = await Restaurant.find({ owner: user._id }).select(
        "_id"
      );
      const restaurantIds = restaurants.map((r) => r._id);

      // Get all menus for user's restaurants
      const menus = await Menu.find({
        restaurant: { $in: restaurantIds },
      })
        .populate("restaurant", "name")
        .sort({ createdAt: -1 });

      return NextResponse.json({ menus });
    }

    if (!restaurantId) {
      return NextResponse.json(
        { error: "Restaurant ID is required" },
        { status: 400 }
      );
    }

    let menus;

    // Build query based on parameters
    const query: any = { restaurant: restaurantId };
    if (menuName) {
      query.name = menuName;
    }

    if (category) {
      // Get specific category from menus
      query["categories.name"] = category;
      menus = await Menu.find(query, {
        "categories.$": 1,
        currency: 1,
        restaurant: 1,
        name: 1,
        description: 1
      }).populate("restaurant", "name");
    } else if (search) {
      // Search in menu items
      query.$or = [
        { "categories.items.name": new RegExp(search, "i") },
        { "categories.items.description": new RegExp(search, "i") },
        { name: new RegExp(search, "i") },
        { description: new RegExp(search, "i") },
      ];
      menus = await Menu.find(query).populate("restaurant", "name");
    } else {
      // Get complete menus
      menus = await Menu.find(query).populate("restaurant", "name");
    }

    if (!menus || menus.length === 0) {
      return NextResponse.json({ error: "No menus found" }, { status: 404 });
    }

    // Filter active categories and available items for each menu
    const filteredMenus = menus.map((menu: any) => ({
      ...menu.toObject(),
      categories: menu.categories
        .filter((cat: { isActive: boolean }) => cat.isActive)
        .map((cat: { items: { status: string }[]; sortOrder?: number }) => ({
          ...cat,
          items: cat.items.filter(
            (item: { status: string }) =>
              item.status === MenuItemStatus.AVAILABLE
          ),
        }))
        .sort(
          (a: { sortOrder?: number }, b: { sortOrder?: number }) =>
            (a.sortOrder || 0) - (b.sortOrder || 0)
        ),
    }));

    // If requesting a specific menu by name, return single menu
    if (menuName && filteredMenus.length === 1) {
      const menu = filteredMenus[0];
      return NextResponse.json({
        menu,
        totalCategories: menu.categories.length,
        totalItems: menu.categories.reduce(
          (sum: number, cat: { items: unknown[] }) => sum + cat.items.length,
          0
        ),
      });
    }

    // Return all menus for the restaurant
    return NextResponse.json({
      menus: filteredMenus,
      totalMenus: filteredMenus.length,
      totalCategories: filteredMenus.reduce(
        (sum: number, menu: { categories: unknown[] }) => sum + menu.categories.length,
        0
      ),
      totalItems: filteredMenus.reduce(
        (sum: number, menu: { categories: { items: unknown[] }[] }) =>
          sum + menu.categories.reduce(
            (catSum: number, cat: { items: unknown[] }) => catSum + cat.items.length,
            0
          ),
        0
      ),
    });
  } catch (error: unknown) {
    console.error("Get menu error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// POST /api/menu - Create or update menu
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
    const { restaurant, name, description, currency, categories } = body;

    // Validate required fields
    if (!restaurant || !name || !categories || !Array.isArray(categories)) {
      return NextResponse.json(
        { error: "Restaurant, menu name, and categories array are required" },
        { status: 400 }
      );
    }

    // Check restaurant access permissions
    const hasAccess = await canAccessRestaurant(user, restaurant);
    if (!hasAccess) {
      return NextResponse.json(
        { error: "Access denied to this restaurant" },
        { status: 403 }
      );
    }

    // Check if restaurant exists
    const restaurantDoc = await Restaurant.findById(restaurant);
    if (!restaurantDoc) {
      return NextResponse.json(
        { error: "Restaurant not found" },
        { status: 404 }
      );
    }

    // Find existing menu by restaurant and name or create new one
    let menu = await Menu.findOne({ restaurant, name });

    if (menu) {
      // Update existing menu
      menu.description = description || menu.description;
      menu.currency = currency || menu.currency || "EUR";
      menu.categories = categories;
      menu.lastUpdated = new Date();
    } else {
      // Create new menu
      menu = new Menu({
        restaurant,
        name,
        description: description || "",
        currency: currency || "EUR",
        categories,
        isActive: true,
      });
    }

    const savedMenu = await menu.save();

    return NextResponse.json(
      {
        message: menu.isNew
          ? "Menu created successfully"
          : "Menu updated successfully",
        menu: savedMenu,
      },
      { status: menu.isNew ? 201 : 200 }
    );
  } catch (error: unknown) {
    console.error("Create/update menu error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
