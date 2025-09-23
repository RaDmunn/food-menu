import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import dbConnect from "@/lib/dbConnect";
import User, { UserRole, UserStatus } from "@/lib/models/User";
import Restaurant from "@/lib/models/Restaurant";
import Menu from "@/lib/models/Menu";

// GET /api/admin/overview - Получить статистику для админ-панели
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    // Проверяем, что пользователь - админ
    const user = await requireAdmin(request);
    if (!user) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Получаем дату месяц назад для подсчета новых записей
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    // Статистика пользователей
    const userStats = await User.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          active: {
            $sum: { $cond: [{ $eq: ["$status", UserStatus.ACTIVE] }, 1, 0] },
          },
          admins: {
            $sum: { $cond: [{ $eq: ["$role", UserRole.ADMIN] }, 1, 0] },
          },
          owners: {
            $sum: {
              $cond: [{ $eq: ["$role", UserRole.RESTAURANT_OWNER] }, 1, 0],
            },
          },
          newThisMonth: {
            $sum: { $cond: [{ $gte: ["$createdAt", oneMonthAgo] }, 1, 0] },
          },
        },
      },
    ]);

    // Статистика ресторанов
    const restaurantStats = await Restaurant.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          active: {
            $sum: { $cond: [{ $eq: ["$status", "active"] }, 1, 0] },
          },
          pending: {
            $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] },
          },
          suspended: {
            $sum: { $cond: [{ $eq: ["$status", "suspended"] }, 1, 0] },
          },
          newThisMonth: {
            $sum: { $cond: [{ $gte: ["$createdAt", oneMonthAgo] }, 1, 0] },
          },
        },
      },
    ]);

    // Статистика меню
    const menuStats = await Menu.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          active: {
            $sum: { $cond: [{ $eq: ["$isActive", true] }, 1, 0] },
          },
          newThisMonth: {
            $sum: { $cond: [{ $gte: ["$createdAt", oneMonthAgo] }, 1, 0] },
          },
        },
      },
    ]);

    // Последние пользователи (за последние 7 дней)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentUsers = await User.find({
      createdAt: { $gte: sevenDaysAgo },
    })
      .select("name email role createdAt")
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    // Последние рестораны (за последние 7 дней)
    const recentRestaurants = await Restaurant.find({
      createdAt: { $gte: sevenDaysAgo },
    })
      .select("name cuisineType status createdAt")
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    // Рестораны ожидающие одобрения
    const pendingRestaurants = await Restaurant.find({
      status: "pending",
    })
      .select("name cuisineType createdAt")
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    // Формируем ответ
    const response = {
      users: userStats[0] || {
        total: 0,
        active: 0,
        admins: 0,
        owners: 0,
        newThisMonth: 0,
      },
      restaurants: restaurantStats[0] || {
        total: 0,
        active: 0,
        pending: 0,
        suspended: 0,
        newThisMonth: 0,
      },
      menus: menuStats[0] || {
        total: 0,
        active: 0,
        newThisMonth: 0,
      },
      recentActivity: {
        newUsers: recentUsers,
        newRestaurants: recentRestaurants,
        pendingApprovals: pendingRestaurants,
      },
    };

    return NextResponse.json(response);
  } catch (error: unknown) {
    console.error("Get admin overview error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
