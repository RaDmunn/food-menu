import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import dbConnect from "@/lib/dbConnect";
import Restaurant from "@/lib/models/Restaurant";

// GET /api/admin/restaurants - Получить все рестораны для админа
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    // Проверяем, что пользователь - админ
    const user = await requireAdmin(request);
    if (!user) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Получаем параметры запроса
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");

    // Строим фильтр
    const filter: any = {};

    if (status && status !== "all") {
      filter.status = status;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { "address.city": { $regex: search, $options: "i" } },
        { "address.country": { $regex: search, $options: "i" } },
        { cuisineType: { $in: [new RegExp(search, "i")] } },
      ];
    }

    // Получаем рестораны с пагинацией
    const restaurants = await Restaurant.find(filter)
      .populate("owner", "name email")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    // Получаем общее количество для пагинации
    const total = await Restaurant.countDocuments(filter);

    // Статистика
    const stats = await Restaurant.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const statusStats = {
      total: await Restaurant.countDocuments(),
      pending: 0,
      active: 0,
      inactive: 0,
      suspended: 0,
    };

    stats.forEach((stat) => {
      if (stat._id in statusStats) {
        statusStats[stat._id as keyof typeof statusStats] = stat.count;
      }
    });

    return NextResponse.json({
      restaurants,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      stats: statusStats,
    });
  } catch (error: unknown) {
    console.error("Get admin restaurants error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
