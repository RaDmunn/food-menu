import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, canAccessRestaurant } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import Menu, { MenuItemStatus } from '@/lib/models/Menu';
import Restaurant from '@/lib/models/Restaurant';

// GET /api/menu - Get complete menu for restaurant
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const restaurantId = searchParams.get('restaurant');
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    if (!restaurantId) {
      return NextResponse.json(
        { error: 'Restaurant ID is required' },
        { status: 400 }
      );
    }

    let menu;

    if (category) {
      // Get specific category
      menu = await Menu.findOne(
        { restaurant: restaurantId, 'categories.name': category },
        { 'categories.$': 1, currency: 1, restaurant: 1 }
      ).populate('restaurant', 'name');
    } else if (search) {
      // Search in menu items
      menu = await Menu.findOne({
        restaurant: restaurantId,
        $or: [
          { 'categories.items.name': new RegExp(search, 'i') },
          { 'categories.items.description': new RegExp(search, 'i') }
        ]
      }).populate('restaurant', 'name');
    } else {
      // Get complete menu
      menu = await Menu.findOne({ restaurant: restaurantId })
        .populate('restaurant', 'name');
    }

    if (!menu) {
      return NextResponse.json(
        { error: 'Menu not found' },
        { status: 404 }
      );
    }

    // Filter active categories and available items
    const filteredMenu = {
      ...menu.toObject(),
      categories: menu.categories
        .filter((cat: { isActive: boolean }) => cat.isActive)
        .map((cat: { items: { status: string }[]; sortOrder?: number }) => ({
          ...cat,
          items: cat.items.filter((item: { status: string }) => item.status === MenuItemStatus.AVAILABLE)
        }))
        .sort((a: { sortOrder?: number }, b: { sortOrder?: number }) => (a.sortOrder || 0) - (b.sortOrder || 0))
    };

    return NextResponse.json({
      menu: filteredMenu,
      totalCategories: filteredMenu.categories.length,
      totalItems: filteredMenu.categories.reduce((sum: number, cat: { items: unknown[] }) => sum + cat.items.length, 0)
    });

  } catch (error: unknown) {
    console.error('Get menu error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

// POST /api/menu - Create or update menu
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    await dbConnect();

    const body = await request.json();
    const { restaurant, currency, categories } = body;

    // Validate required fields
    if (!restaurant || !categories || !Array.isArray(categories)) {
      return NextResponse.json(
        { error: 'Restaurant and categories array are required' },
        { status: 400 }
      );
    }

    // Check restaurant access permissions
    const hasAccess = await canAccessRestaurant(user, restaurant);
    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Access denied to this restaurant' },
        { status: 403 }
      );
    }

    // Check if restaurant exists
    const restaurantDoc = await Restaurant.findById(restaurant);
    if (!restaurantDoc) {
      return NextResponse.json(
        { error: 'Restaurant not found' },
        { status: 404 }
      );
    }

    // Find existing menu or create new one
    let menu = await Menu.findOne({ restaurant });

    if (menu) {
      // Update existing menu
      menu.currency = currency || menu.currency || 'EUR';
      menu.categories = categories;
      menu.lastUpdated = new Date();
    } else {
      // Create new menu
      menu = new Menu({
        restaurant,
        currency: currency || 'EUR',
        categories,
        isActive: true
      });
    }

    const savedMenu = await menu.save();

    return NextResponse.json({
      message: menu.isNew ? 'Menu created successfully' : 'Menu updated successfully',
      menu: savedMenu
    }, { status: menu.isNew ? 201 : 200 });

  } catch (error: unknown) {
    console.error('Create/update menu error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}