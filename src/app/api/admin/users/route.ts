import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import dbConnect from "@/lib/dbConnect";
import User from "@/lib/models/User";

// GET /api/admin/users - Получить всех пользователей для админа
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
    const role = searchParams.get("role");
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");

    // Строим фильтр
    const filter: any = {};

    if (role && role !== "all") {
      filter.role = role;
    }

    if (status && status !== "all") {
      filter.status = status;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }

    // Получаем пользователей с пагинацией
    const users = await User.find(filter)
      .select("-passwordHash -passwordSalt") // Исключаем пароли из ответа
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    // Получаем общее количество для пагинации
    const total = await User.countDocuments(filter);

    // Статистика
    const stats = await User.aggregate([
      {
        $group: {
          _id: null,
          totalUsers: { $sum: 1 },
          adminCount: {
            $sum: { $cond: [{ $eq: ["$role", "ADMIN"] }, 1, 0] },
          },
          ownerCount: {
            $sum: { $cond: [{ $eq: ["$role", "RESTAURANT_OWNER"] }, 1, 0] },
          },
          activeCount: {
            $sum: { $cond: [{ $eq: ["$status", "ACTIVE"] }, 1, 0] },
          },
          inactiveCount: {
            $sum: { $cond: [{ $eq: ["$status", "INACTIVE"] }, 1, 0] },
          },
          suspendedCount: {
            $sum: { $cond: [{ $eq: ["$status", "SUSPENDED"] }, 1, 0] },
          },
        },
      },
    ]);

    const userStats = stats[0] || {
      totalUsers: 0,
      adminCount: 0,
      ownerCount: 0,
      activeCount: 0,
      inactiveCount: 0,
      suspendedCount: 0,
    };

    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      stats: userStats,
    });
  } catch (error: unknown) {
    console.error("Get admin users error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
