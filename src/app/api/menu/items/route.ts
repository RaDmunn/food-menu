import { NextRequest, NextResponse } from "next/server";
import { requireAuth, canAccessRestaurant } from "@/lib/auth";
import dbConnect from "@/lib/dbConnect";
import Menu, {
  MenuItemStatus,
  IMenuCategory,
  IMenuItem,
} from "@/lib/models/Menu";

// POST /api/menu/items - Add item to menu category
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
    const {
      restaurantId,
      menuName,
      categoryName,
      name,
      description,
      price,
      allergens,
      isVegetarian,
      isVegan,
      isGlutenFree,
      isSpicy,
      spicyLevel,
      containsAlcohol,
      calories,
      preparationTime,
      ingredients,
      images,
      nutritionalInfo,
    } = body;

    // Validate required fields
    if (
      !restaurantId ||
      !menuName ||
      !categoryName ||
      !name ||
      price === undefined
    ) {
      return NextResponse.json(
        {
          error:
            "Restaurant ID, menu name, category name, item name, and price are required",
        },
        { status: 400 }
      );
    }

    // Check restaurant access permissions
    const hasAccess = await canAccessRestaurant(user, restaurantId);
    if (!hasAccess) {
      return NextResponse.json(
        { error: "Access denied to this restaurant" },
        { status: 403 }
      );
    }

    // Find specific menu by restaurant and name
    const menu = await Menu.findOne({
      restaurant: restaurantId,
      name: menuName,
    });
    if (!menu) {
      return NextResponse.json(
        { error: "Menu not found. Create the menu first." },
        { status: 404 }
      );
    }

    // Find category
    const category = menu.categories.find(
      (cat: IMenuCategory) =>
        cat.name.toLowerCase() === categoryName.toLowerCase() && cat.isActive
    );

    if (!category) {
      return NextResponse.json(
        { error: "Category not found or inactive" },
        { status: 404 }
      );
    }

    // Check if item already exists in category
    const existingItem = category.items.find(
      (item: IMenuItem) => item.name.toLowerCase() === name.toLowerCase()
    );

    if (existingItem) {
      return NextResponse.json(
        { error: "Item with this name already exists in category" },
        { status: 400 }
      );
    }

    // Create new menu item
    const newItem = {
      name,
      description: description || "",
      price,
      allergens: allergens || [],
      isVegetarian: isVegetarian || false,
      isVegan: isVegan || false,
      isGlutenFree: isGlutenFree || false,
      isSpicy: isSpicy || false,
      spicyLevel: isSpicy ? spicyLevel || 1 : undefined,
      containsAlcohol: containsAlcohol || false,
      calories,
      preparationTime,
      ingredients: ingredients || [],
      images: images || [],
      status: MenuItemStatus.AVAILABLE,
      isPopular: false,
      isRecommended: false,
      nutritionalInfo,
    };

    // Add item to category
    category.items.push(newItem);
    menu.lastUpdated = new Date();

    await menu.save();

    // Get the added item (last item in the category)
    const addedItem = category.items[category.items.length - 1];

    return NextResponse.json(
      {
        message: "Menu item added successfully",
        item: addedItem,
        categoryName: category.name,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Add menu item error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// PUT /api/menu/items - Update menu item
export async function PUT(request: NextRequest) {
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
    const { restaurantId, categoryName, itemName, updates } = body;

    // Validate required fields
    if (!restaurantId || !categoryName || !itemName || !updates) {
      return NextResponse.json(
        {
          error:
            "Restaurant ID, category name, item name, and updates are required",
        },
        { status: 400 }
      );
    }

    // Check restaurant access permissions
    const hasAccess = await canAccessRestaurant(user, restaurantId);
    if (!hasAccess) {
      return NextResponse.json(
        { error: "Access denied to this restaurant" },
        { status: 403 }
      );
    }

    // Find menu and update item
    const menu = await Menu.findOneAndUpdate(
      {
        restaurant: restaurantId,
        "categories.name": categoryName,
        "categories.items.name": itemName,
      },
      {
        $set: {
          "categories.$[cat].items.$[item]": { ...updates },
          lastUpdated: new Date(),
        },
      },
      {
        arrayFilters: [{ "cat.name": categoryName }, { "item.name": itemName }],
        new: true,
      }
    );

    if (!menu) {
      return NextResponse.json(
        { error: "Menu, category, or item not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Menu item updated successfully",
      menu,
    });
  } catch (error: unknown) {
    console.error("Update menu item error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// DELETE /api/menu/items - Delete menu item
export async function DELETE(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const restaurantId = searchParams.get("restaurant");
    const categoryName = searchParams.get("category");
    const itemName = searchParams.get("item");

    // Validate required fields
    if (!restaurantId || !categoryName || !itemName) {
      return NextResponse.json(
        { error: "Restaurant ID, category name, and item name are required" },
        { status: 400 }
      );
    }

    // Check restaurant access permissions
    const hasAccess = await canAccessRestaurant(user, restaurantId);
    if (!hasAccess) {
      return NextResponse.json(
        { error: "Access denied to this restaurant" },
        { status: 403 }
      );
    }

    // Remove item from menu
    const menu = await Menu.findOneAndUpdate(
      {
        restaurant: restaurantId,
        "categories.name": categoryName,
      },
      {
        $pull: {
          "categories.$.items": { name: itemName },
        },
        $set: {
          lastUpdated: new Date(),
        },
      },
      { new: true }
    );

    if (!menu) {
      return NextResponse.json(
        { error: "Menu or category not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Menu item deleted successfully",
    });
  } catch (error: unknown) {
    console.error("Delete menu item error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
