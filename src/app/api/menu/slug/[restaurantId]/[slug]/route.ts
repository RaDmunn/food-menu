import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Menu from "@/lib/models/Menu";
import mongoose from "mongoose";

// GET /api/menu/slug/[restaurantId]/[slug] - Получить меню по slug
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ restaurantId: string; slug: string }> }
) {
  try {
    await dbConnect();

    const { restaurantId, slug } = await params;

    if (!restaurantId || !slug) {
      return NextResponse.json(
        { error: "Restaurant ID and menu slug are required" },
        { status: 400 }
      );
    }

    // Проверяем валидность ObjectId
    if (!mongoose.Types.ObjectId.isValid(restaurantId)) {
      return NextResponse.json(
        { error: "Invalid restaurant ID" },
        { status: 400 }
      );
    }

    // Ищем меню по slug
    const menu = await Menu.findMenuBySlug(
      new mongoose.Types.ObjectId(restaurantId),
      slug
    ).populate("restaurant", "name slug");

    if (!menu) {
      return NextResponse.json({ error: "Menu not found" }, { status: 404 });
    }

    return NextResponse.json({ menu }, { status: 200 });
  } catch (error: unknown) {
    console.error("Get menu by slug error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
