import { NextRequest, NextResponse } from "next/server";
import { requireAuth, canAccessRestaurant } from "@/lib/auth";
import dbConnect from "@/lib/dbConnect";
import Menu, { IMenuSection } from "@/lib/models/Menu";

// GET /api/menu/sections - Get all sections for a menu
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const restaurantId = searchParams.get("restaurant");
    const menuName = searchParams.get("menu");

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

    const menu = await Menu.findOne({ 
      restaurant: restaurantId, 
      name: menuName 
    });

    if (!menu) {
      return NextResponse.json({
        sections: [],
        count: 0,
      });
    }

    // Filter active sections and sort by sortOrder
    const activeSections = menu.sections
      .filter((section) => section.isActive)
      .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

    return NextResponse.json({
      sections: activeSections,
      count: activeSections.length,
    });
  } catch (error: unknown) {
    console.error("Get sections error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// POST /api/menu/sections - Create a new section
export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const user = await requireAuth(request);
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const body = await request.json();
    const { restaurantId, menuName, sectionName, description, sortOrder } =
      body;

    if (!restaurantId || !menuName || !sectionName) {
      return NextResponse.json(
        { error: "Restaurant ID, menu name, and section name are required" },
        { status: 400 }
      );
    }

    // Check if user can access this restaurant
    const canAccess = await canAccessRestaurant(user, restaurantId);
    if (!canAccess) {
      return NextResponse.json(
        { error: "Access denied to this restaurant" },
        { status: 403 }
      );
    }

    // Find the menu
    const menu = await Menu.findOne({
      restaurant: restaurantId,
      name: menuName,
    });

    if (!menu) {
      return NextResponse.json({ error: "Menu not found" }, { status: 404 });
    }

    // Check if section already exists
    const existingSection = menu.sections.find(
      (section) => section.name.toLowerCase() === sectionName.toLowerCase()
    );

    if (existingSection) {
      return NextResponse.json(
        { error: "Section with this name already exists" },
        { status: 400 }
      );
    }

    // Create new section
    const newSection: IMenuSection = {
      name: sectionName,
      description: description || "",
      categories: [],
      isActive: true,
      sortOrder: sortOrder || menu.sections.length,
    };

    menu.sections.push(newSection);
    await menu.save();

    return NextResponse.json(
      {
        message: "Section created successfully",
        section: newSection,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Create section error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// PUT /api/menu/sections - Update a section
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
      newSectionName,
      description,
      sortOrder,
      isActive,
    } = body;

    if (!restaurantId || !menuName || !sectionName) {
      return NextResponse.json(
        { error: "Restaurant ID, menu name, and section name are required" },
        { status: 400 }
      );
    }

    // Check if user can access this restaurant
    const canAccess = await canAccessRestaurant(user, restaurantId);
    if (!canAccess) {
      return NextResponse.json(
        { error: "Access denied to this restaurant" },
        { status: 403 }
      );
    }

    // Find the menu
    const menu = await Menu.findOne({
      restaurant: restaurantId,
      name: menuName,
    });

    if (!menu) {
      return NextResponse.json({ error: "Menu not found" }, { status: 404 });
    }

    // Find the section to update
    const sectionIndex = menu.sections.findIndex(
      (section) => section.name.toLowerCase() === sectionName.toLowerCase()
    );

    if (sectionIndex === -1) {
      return NextResponse.json(
        { error: "Section not found" },
        { status: 404 }
      );
    }

    // If changing name, check if new name already exists
    if (
      newSectionName &&
      newSectionName.toLowerCase() !== sectionName.toLowerCase()
    ) {
      const existingSection = menu.sections.find(
        (section) =>
          section.name.toLowerCase() === newSectionName.toLowerCase()
      );

      if (existingSection) {
        return NextResponse.json(
          { error: "Section with this name already exists" },
          { status: 400 }
        );
      }
    }

    // Update section
    const section = menu.sections[sectionIndex];
    if (newSectionName) section.name = newSectionName;
    if (description !== undefined) section.description = description;
    if (sortOrder !== undefined) section.sortOrder = sortOrder;
    if (isActive !== undefined) section.isActive = isActive;

    await menu.save();

    return NextResponse.json({
      message: "Section updated successfully",
      section: section,
    });
  } catch (error: unknown) {
    console.error("Update section error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// DELETE /api/menu/sections - Delete a section
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

    if (!restaurantId || !menuName || !sectionName) {
      return NextResponse.json(
        { error: "Restaurant ID, menu name, and section name are required" },
        { status: 400 }
      );
    }

    // Check if user can access this restaurant
    const canAccess = await canAccessRestaurant(user, restaurantId);
    if (!canAccess) {
      return NextResponse.json(
        { error: "Access denied to this restaurant" },
        { status: 403 }
      );
    }

    // Find the menu
    const menu = await Menu.findOne({
      restaurant: restaurantId,
      name: menuName,
    });

    if (!menu) {
      return NextResponse.json({ error: "Menu not found" }, { status: 404 });
    }

    // Find and remove the section
    const sectionIndex = menu.sections.findIndex(
      (section) => section.name.toLowerCase() === sectionName.toLowerCase()
    );

    if (sectionIndex === -1) {
      return NextResponse.json(
        { error: "Section not found" },
        { status: 404 }
      );
    }

    menu.sections.splice(sectionIndex, 1);
    await menu.save();

    return NextResponse.json({
      message: "Section deleted successfully",
    });
  } catch (error: unknown) {
    console.error("Delete section error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
