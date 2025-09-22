import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Restaurant from "@/lib/models/Restaurant";

// GET /api/restaurants/slug/[slug] - Получить ресторан по slug
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    await dbConnect();

    const { slug } = await params;

    if (!slug) {
      return NextResponse.json(
        { error: "Restaurant slug is required" },
        { status: 400 }
      );
    }

    // Ищем ресторан по slug
    const restaurant = await Restaurant.findBySlug(slug);

    if (!restaurant) {
      return NextResponse.json(
        { error: "Restaurant not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ restaurant }, { status: 200 });
  } catch (error: unknown) {
    console.error("Get restaurant by slug error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
