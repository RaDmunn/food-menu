import { NextRequest, NextResponse } from "next/server";
import { requireAuth, canAccessRestaurant } from "@/lib/auth";
import dbConnect from "@/lib/dbConnect";
import Menu, { IMenuCategory } from "@/lib/models/Menu";

// GET /api/menu/categories - Get all categories for a section within a menu
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const restaurantId = searchParams.get("restaurant");
    const menuName = searchParams.get("menu");
    const sectionName = searchParams.get("section");

    if (!restaurantId) {
      return NextResponse.json(
        { error: "Restaurant ID is required" },
        { status: 400 }
      );
    }

    if (!menuName) {
      return NextResponse.json(
        { error: "Menu name is required" },
        { status: 400 }
      );
    }

    if (!sectionName) {
      return NextResponse.json(
        { error: "Section name is required" },
        { status: 400 }
      );
    }

    const menu = await Menu.findOne({
      restaurant: restaurantId,
      name: menuName
    });

    if (!menu) {
      return NextResponse.json({
        categories: [],
        count: 0,
      });
    }

    // Find the specific section
    const section = menu.sections.find(
      (sec) => sec.name.toLowerCase() === sectionName.toLowerCase() && sec.isActive
    );

    if (!section) {
      return NextResponse.json({
        categories: [],
        count: 0,
      });
    }

    const categories = section.categories
      .filter((cat: IMenuCategory) => cat.isActive)
      .map((cat: IMenuCategory) => ({
        name: cat.name,
        description: cat.description,
        itemCount: cat.items.length,
        sortOrder: cat.sortOrder,
      }))
      .sort(
        (a: { sortOrder?: number }, b: { sortOrder?: number }) =>
          (a.sortOrder || 0) - (b.sortOrder || 0)
      );

    return NextResponse.json({
      categories,
      count: categories.length,
    });
  } catch (error: unknown) {
    console.error("Get categories error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// POST /api/menu/categories - Add a new category to a section within a menu
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    await dbConnect();

    const body = await request.json();
    const { restaurantId, menuName, sectionName, categoryName, description, sortOrder } =
      body;

    if (!restaurantId || !menuName || !sectionName || !categoryName) {
      return NextResponse.json(
        { error: "Restaurant ID, menu name, section name, and category name are required" },
        { status: 400 }
      );
    }

    // Check if user has access to this restaurant
    const canAccess = await canAccessRestaurant(user, restaurantId);
    if (!canAccess) {
      return NextResponse.json(
        { error: "Access denied to this restaurant" },
        { status: 403 }
      );
    }

    // Find specific menu by restaurant and name
    let menu = await Menu.findOne({ restaurant: restaurantId, name: menuName });

    if (!menu) {
      return NextResponse.json(
        { error: "Menu not found. Please create the menu first." },
        { status: 404 }
      );
    }

    // Find the specific section
    const sectionIndex = menu.sections.findIndex(
      (sec) => sec.name.toLowerCase() === sectionName.toLowerCase()
    );

    if (sectionIndex === -1) {
      return NextResponse.json(
        { error: "Section not found. Please create the section first." },
        { status: 404 }
      );
    }

    const section = menu.sections[sectionIndex];

    // Check if category already exists in this section
    const existingCategory = section.categories.find(
      (cat: IMenuCategory) =>
        cat.name.toLowerCase() === categoryName.toLowerCase()
    );

    if (existingCategory) {
      return NextResponse.json(
        { error: "Category with this name already exists in this section" },
        { status: 400 }
      );
    }

    // Add new category to the section
    const newCategory: IMenuCategory = {
      name: categoryName,
      description: description || "",
      items: [],
      isActive: true,
      sortOrder: sortOrder || section.categories.length,
    };

    section.categories.push(newCategory);
    await menu.save();

    return NextResponse.json(
      {
        message: "Category added successfully",
        category: newCategory,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Create category error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// PUT /api/menu/categories - Update category
export async function PUT(request: NextRequest) {
  try {
    await dbConnect();

    const user = await requireAuth(request);
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const body = await request.json();
    const {
      restaurantId,
      menuName,
      sectionName,
      categoryName,
      newCategoryName,
      description,
      sortOrder,
    } = body;

    // Validate required fields
    if (!restaurantId || !menuName || !sectionName || !categoryName) {
      return NextResponse.json(
        { error: "Restaurant ID, menu name, section name, and category name are required" },
        { status: 400 }
      );
    }

    // Check if user has access to this restaurant
    const canAccess = await canAccessRestaurant(user, restaurantId);
    if (!canAccess) {
      return NextResponse.json(
        { error: "Access denied to this restaurant" },
        { status: 403 }
      );
    }

    // Find and update category
    const menu = await Menu.findOneAndUpdate(
      {
        restaurant: restaurantId,
        name: menuName,
        "sections.name": sectionName,
        "sections.categories.name": categoryName,
      },
      {
        $set: {
          "sections.$[sec].categories.$[cat].name": newCategoryName || categoryName,
          "sections.$[sec].categories.$[cat].description": description,
          "sections.$[sec].categories.$[cat].sortOrder": sortOrder,
          lastUpdated: new Date(),
        },
      },
      {
        arrayFilters: [
          { "sec.name": sectionName },
          { "cat.name": categoryName }
        ],
        new: true,
      }
    );

    if (!menu) {
      return NextResponse.json(
        { error: "Menu, section, or category not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Category updated successfully",
      menu,
    });
  } catch (error: unknown) {
    console.error("Update category error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// DELETE /api/menu/categories - Delete category
export async function DELETE(request: NextRequest) {
  try {
    await dbConnect();

    const user = await requireAuth(request);
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const restaurantId = searchParams.get("restaurant");
    const menuName = searchParams.get("menu");
    const sectionName = searchParams.get("section");
    const categoryName = searchParams.get("category");

    // Validate required fields
    if (!restaurantId || !menuName || !sectionName || !categoryName) {
      return NextResponse.json(
        { error: "Restaurant ID, menu name, section name, and category name are required" },
        { status: 400 }
      );
    }

    // Check if user has access to this restaurant
    const canAccess = await canAccessRestaurant(user, restaurantId);
    if (!canAccess) {
      return NextResponse.json(
        { error: "Access denied to this restaurant" },
        { status: 403 }
      );
    }

    // Remove category from section
    const menu = await Menu.findOneAndUpdate(
      {
        restaurant: restaurantId,
        name: menuName,
        "sections.name": sectionName,
      },
      {
        $pull: {
          "sections.$[sec].categories": { name: categoryName },
        },
        $set: {
          lastUpdated: new Date(),
        },
      },
      {
        arrayFilters: [{ "sec.name": sectionName }],
        new: true,
      }
    );

    if (!menu) {
      return NextResponse.json(
        { error: "Menu or section not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Category deleted successfully",
    });
  } catch (error: unknown) {
    console.error("Delete category error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
