import mongoose, { Document, Schema } from "mongoose";
import { generateSlug, generateUniqueSlug } from "@/lib/utils/slug";

// Enum for menu item status
export enum MenuItemStatus {
  AVAILABLE = "available",
  UNAVAILABLE = "unavailable",
  SEASONAL = "seasonal",
  DISCONTINUED = "discontinued",
}

// Enum for European allergens
export enum Allergen {
  GLUTEN = "Gluten",
  DAIRY = "Dairy",
  EGGS = "Eggs",
  NUTS = "Nuts",
  PEANUTS = "Peanuts",
  SHELLFISH = "Shellfish",
  FISH = "Fish",
  SOY = "Soy",
  SESAME = "Sesame",
  SULFITES = "Sulfites",
  CELERY = "Celery",
  MUSTARD = "Mustard",
  LUPIN = "Lupin",
  MOLLUSCS = "Molluscs",
}

// Interface for menu item sizes
export interface IMenuItemSize {
  name: string; // "Small", "Medium", "Large", "Half", "Full"
  price: number;
  weight?: number; // в граммах
  volume?: number; // в мл для напитков
  description?: string; // "Perfect for sharing"
}

// Interface for availability schedule
export interface IAvailabilitySchedule {
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  startTime: string; // "09:00"
  endTime: string; // "14:00"
}

// Interface for menu item
export interface IMenuItem {
  name: string;
  description?: string;
  price: number;

  // Размеры порций
  sizes?: IMenuItemSize[];
  defaultSize?: string; // Размер по умолчанию
  servingSize?: string; // "Serves 2-3 people"

  allergens?: Allergen[];

  // Базовые диетические ограничения
  isVegetarian?: boolean;
  isVegan?: boolean;
  isGlutenFree?: boolean;

  // Расширенные диетические метки
  isKeto?: boolean;
  isPaleo?: boolean;
  isLowCarb?: boolean;
  isLowFat?: boolean;
  isLowSodium?: boolean;
  isOrganic?: boolean;
  isLocallySourced?: boolean;
  isHalal?: boolean;
  isKosher?: boolean;

  isSpicy?: boolean;
  spicyLevel?: number; // 1-5
  containsAlcohol?: boolean;
  calories?: number;
  preparationTime?: number; // in minutes
  ingredients?: string[];
  images?: string[]; // URLs of images
  status: MenuItemStatus;
  isPopular?: boolean;
  isRecommended?: boolean;

  // Маркетинговые теги
  isNewItem?: boolean; // Новинка
  isLimitedTime?: boolean; // Ограниченное предложение
  tags?: string[]; // "Bestseller", "Chef's Choice", "Healthy"

  // Расширенная пищевая ценность
  nutritionalInfo?: {
    protein?: number; // г
    carbs?: number; // г
    fat?: number; // г
    fiber?: number; // г
    sugar?: number; // г
    sodium?: number; // мг
    cholesterol?: number; // мг
    saturatedFat?: number; // г
    transFat?: number; // г
    vitaminC?: number; // мг
    calcium?: number; // мг
    iron?: number; // мг
  };
}

// Interface for menu category
export interface IMenuCategory {
  name: string;
  description?: string;
  items: IMenuItem[];
  isActive: boolean;
  sortOrder?: number;
}

// Interface for menu section (new level between menu and categories)
export interface IMenuSection {
  name: string; // e.g., "Kitchen", "Bar", "Lunch", "Desserts"
  description?: string;
  categories: IMenuCategory[];
  isActive: boolean;
  sortOrder?: number;

  // Время доступности для секций
  availabilitySchedule?: IAvailabilitySchedule[]; // Когда секция доступна
  seasonalAvailability?: {
    startMonth: number; // 1-12
    endMonth: number; // 1-12
  };
}

// Interface for complete menu
export interface IMenu extends Document {
  restaurant: mongoose.Types.ObjectId; // Reference to restaurant
  name: string; // Menu name (e.g., "Breakfast Menu", "Dinner Menu", "Wine List")
  slug: string; // URL-friendly название для ссылок
  description?: string; // Optional menu description
  currency: string;
  sections: IMenuSection[]; // Changed from categories to sections
  isActive: boolean;
  lastUpdated: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Schema for menu item size (subdocument)
const MenuItemSizeSchema = new Schema<IMenuItemSize>(
  {
    name: {
      type: String,
      required: [true, "Size name is required"],
      trim: true,
      maxlength: [50, "Size name cannot exceed 50 characters"],
    },
    price: {
      type: Number,
      required: [true, "Size price is required"],
      min: [0, "Price cannot be negative"],
    },
    weight: {
      type: Number,
      min: [0, "Weight cannot be negative"],
    },
    volume: {
      type: Number,
      min: [0, "Volume cannot be negative"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [200, "Size description cannot exceed 200 characters"],
    },
  },
  { _id: false }
);

// Schema for availability schedule (subdocument)
const AvailabilityScheduleSchema = new Schema<IAvailabilitySchedule>(
  {
    dayOfWeek: {
      type: Number,
      required: [true, "Day of week is required"],
      min: [0, "Day of week must be between 0-6"],
      max: [6, "Day of week must be between 0-6"],
    },
    startTime: {
      type: String,
      required: [true, "Start time is required"],
      match: [
        /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
        "Invalid time format (HH:MM)",
      ],
    },
    endTime: {
      type: String,
      required: [true, "End time is required"],
      match: [
        /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
        "Invalid time format (HH:MM)",
      ],
    },
  },
  { _id: false }
);

// Schema for menu item (subdocument)
const MenuItemSchema = new Schema<IMenuItem>(
  {
    name: {
      type: String,
      required: [true, "Menu item name is required"],
      trim: true,
      maxlength: [100, "Menu item name cannot exceed 100 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },

    // Размеры порций
    sizes: [MenuItemSizeSchema],
    defaultSize: {
      type: String,
      trim: true,
    },
    servingSize: {
      type: String,
      trim: true,
      maxlength: [100, "Serving size cannot exceed 100 characters"],
    },

    allergens: [
      {
        type: String,
        enum: Object.values(Allergen),
      },
    ],
    isVegetarian: {
      type: Boolean,
      default: false,
    },
    isVegan: {
      type: Boolean,
      default: false,
    },
    isGlutenFree: {
      type: Boolean,
      default: false,
    },

    // Расширенные диетические метки
    isKeto: {
      type: Boolean,
      default: false,
    },
    isPaleo: {
      type: Boolean,
      default: false,
    },
    isLowCarb: {
      type: Boolean,
      default: false,
    },
    isLowFat: {
      type: Boolean,
      default: false,
    },
    isLowSodium: {
      type: Boolean,
      default: false,
    },
    isOrganic: {
      type: Boolean,
      default: false,
    },
    isLocallySourced: {
      type: Boolean,
      default: false,
    },
    isHalal: {
      type: Boolean,
      default: false,
    },
    isKosher: {
      type: Boolean,
      default: false,
    },

    isSpicy: {
      type: Boolean,
      default: false,
    },
    spicyLevel: {
      type: Number,
      min: 1,
      max: 5,
    },
    containsAlcohol: {
      type: Boolean,
      default: false,
    },
    calories: {
      type: Number,
      min: 0,
    },
    preparationTime: {
      type: Number,
      min: 0,
    },
    ingredients: [
      {
        type: String,
        trim: true,
      },
    ],
    images: [
      {
        type: String,
        trim: true,
      },
    ],
    status: {
      type: String,
      enum: Object.values(MenuItemStatus),
      default: MenuItemStatus.AVAILABLE,
    },
    isPopular: {
      type: Boolean,
      default: false,
    },
    isRecommended: {
      type: Boolean,
      default: false,
    },

    // Маркетинговые теги
    isNewItem: {
      type: Boolean,
      default: false,
    },
    isLimitedTime: {
      type: Boolean,
      default: false,
    },
    tags: [
      {
        type: String,
        trim: true,
        maxlength: [50, "Tag cannot exceed 50 characters"],
      },
    ],

    // Расширенная пищевая ценность
    nutritionalInfo: {
      protein: {
        type: Number,
        min: 0,
      },
      carbs: {
        type: Number,
        min: 0,
      },
      fat: {
        type: Number,
        min: 0,
      },
      fiber: {
        type: Number,
        min: 0,
      },
      sugar: {
        type: Number,
        min: 0,
      },
      sodium: {
        type: Number,
        min: 0,
      },
      cholesterol: {
        type: Number,
        min: 0,
      },
      saturatedFat: {
        type: Number,
        min: 0,
      },
      transFat: {
        type: Number,
        min: 0,
      },
      vitaminC: {
        type: Number,
        min: 0,
      },
      calcium: {
        type: Number,
        min: 0,
      },
      iron: {
        type: Number,
        min: 0,
      },
    },
  },
  { _id: false }
);

// Schema for menu category (subdocument)
const MenuCategorySchema = new Schema<IMenuCategory>(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      trim: true,
      maxlength: [50, "Category name cannot exceed 50 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [200, "Category description cannot exceed 200 characters"],
    },
    items: [MenuItemSchema],
    isActive: {
      type: Boolean,
      default: true,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
  },
  { _id: false }
);

// Schema for menu section (subdocument)
const MenuSectionSchema = new Schema<IMenuSection>(
  {
    name: {
      type: String,
      required: [true, "Section name is required"],
      trim: true,
      maxlength: [50, "Section name cannot exceed 50 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [200, "Section description cannot exceed 200 characters"],
    },
    categories: [MenuCategorySchema],
    isActive: {
      type: Boolean,
      default: true,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },

    // Время доступности для секций
    availabilitySchedule: [AvailabilityScheduleSchema],
    seasonalAvailability: {
      startMonth: {
        type: Number,
        min: [1, "Start month must be between 1-12"],
        max: [12, "Start month must be between 1-12"],
      },
      endMonth: {
        type: Number,
        min: [1, "End month must be between 1-12"],
        max: [12, "End month must be between 1-12"],
      },
    },
  },
  { _id: false }
);

// Main menu schema
const MenuSchema = new Schema<IMenu>(
  {
    restaurant: {
      type: Schema.Types.ObjectId,
      ref: "Restaurant",
      required: [true, "Restaurant is required"],
    },
    name: {
      type: String,
      required: [true, "Menu name is required"],
      trim: true,
      maxlength: [100, "Menu name cannot exceed 100 characters"],
    },
    slug: {
      type: String,
      trim: true,
      lowercase: true,
      maxlength: [100, "Menu slug cannot exceed 100 characters"],
      match: [
        /^[a-z0-9]+(-[a-z0-9]+)*$/,
        "Slug must contain only lowercase letters, numbers, and hyphens",
      ],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Menu description cannot exceed 500 characters"],
    },
    currency: {
      type: String,
      required: [true, "Currency is required"],
      default: "EUR",
      maxlength: 3,
    },
    sections: [MenuSectionSchema],
    isActive: {
      type: Boolean,
      default: true,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for search optimization
MenuSchema.index({ restaurant: 1 }); // Index for restaurant queries
MenuSchema.index({ restaurant: 1, name: 1 }, { unique: true }); // Unique menu name per restaurant (allows multiple menus)
MenuSchema.index({ restaurant: 1, slug: 1 }, { unique: true }); // Unique menu slug per restaurant
MenuSchema.index({ restaurant: 1, isActive: 1 }); // Index for active menus per restaurant
MenuSchema.index({ isActive: 1 });
MenuSchema.index({ lastUpdated: -1 });
MenuSchema.index({ name: "text", description: "text" }); // Text search for menu names and descriptions
MenuSchema.index({ "sections.name": 1 }); // Index for sections
MenuSchema.index({ "sections.categories.name": 1 }); // Index for categories within sections
MenuSchema.index({
  "sections.categories.items.name": "text",
  "sections.categories.items.description": "text",
}); // Text search for menu items
MenuSchema.index({ "sections.categories.items.price": 1 });
MenuSchema.index({ "sections.categories.items.isVegetarian": 1 });
MenuSchema.index({ "sections.categories.items.isVegan": 1 });
MenuSchema.index({ "sections.categories.items.isPopular": 1 });

// Virtual fields for menu items
MenuItemSchema.virtual("formattedPrice").get(function (this: IMenuItem) {
  // Currency will be taken from parent menu document
  return `${this.price}`;
});

// Instance methods for menu items
MenuItemSchema.methods.isAvailable = function () {
  return this.status === MenuItemStatus.AVAILABLE;
};

MenuItemSchema.methods.hasDietaryRestrictions = function () {
  return this.allergens && this.allergens.length > 0;
};

MenuItemSchema.methods.getDietaryTags = function () {
  const tags = [];
  if (this.isVegetarian) tags.push("Vegetarian");
  if (this.isVegan) tags.push("Vegan");
  if (this.isGlutenFree) tags.push("Gluten-Free");
  if (this.isSpicy) tags.push(`Spicy (${this.spicyLevel}/5)`);
  if (this.containsAlcohol) tags.push("Contains Alcohol");
  return tags;
};

// Static methods for Menu
MenuSchema.statics.findByRestaurant = function (
  restaurantId: mongoose.Types.ObjectId
) {
  return this.find({ restaurant: restaurantId });
};

MenuSchema.statics.findMenuByName = function (
  restaurantId: mongoose.Types.ObjectId,
  menuName: string
) {
  return this.findOne({ restaurant: restaurantId, name: menuName });
};

MenuSchema.statics.findMenuBySlug = function (
  restaurantId: mongoose.Types.ObjectId,
  menuSlug: string
) {
  return this.findOne({ restaurant: restaurantId, slug: menuSlug });
};

MenuSchema.statics.findActiveMenus = function () {
  return this.find({ isActive: true });
};

// New method for finding by section
MenuSchema.statics.findBySection = function (
  restaurantId: mongoose.Types.ObjectId,
  sectionName: string,
  menuName?: string
) {
  const query: any = {
    restaurant: restaurantId,
    "sections.name": sectionName,
  };
  if (menuName) {
    query.name = menuName;
  }
  return this.find(query, {
    name: 1,
    currency: 1,
    restaurant: 1,
    "sections.$": 1,
  });
};

// Updated method for finding by category (now within sections)
MenuSchema.statics.findByCategory = function (
  restaurantId: mongoose.Types.ObjectId,
  sectionName: string,
  categoryName: string,
  menuName?: string
) {
  const query: any = {
    restaurant: restaurantId,
    "sections.name": sectionName,
    "sections.categories.name": categoryName,
  };
  if (menuName) {
    query.name = menuName;
  }
  return this.find(query);
};

// New method for getting sections
MenuSchema.statics.getSectionsForRestaurant = function (
  restaurantId: mongoose.Types.ObjectId,
  menuName?: string
) {
  const query: any = { restaurant: restaurantId };
  if (menuName) {
    query.name = menuName;
  }
  return this.find(query, {
    name: 1,
    "sections.name": 1,
    "sections.description": 1,
    "sections.isActive": 1,
    "sections.sortOrder": 1,
  });
};

// New method for getting categories within a section
MenuSchema.statics.getCategoriesForSection = function (
  restaurantId: mongoose.Types.ObjectId,
  sectionName: string,
  menuName?: string
) {
  const query: any = {
    restaurant: restaurantId,
    "sections.name": sectionName,
  };
  if (menuName) {
    query.name = menuName;
  }
  return this.find(query, {
    name: 1,
    "sections.$": 1,
  });
};

MenuSchema.statics.searchMenuItems = function (
  restaurantId: mongoose.Types.ObjectId,
  searchTerm: string,
  menuName?: string
) {
  const query: any = {
    restaurant: restaurantId,
    $or: [
      { "sections.categories.items.name": new RegExp(searchTerm, "i") },
      { "sections.categories.items.description": new RegExp(searchTerm, "i") },
    ],
  };
  if (menuName) {
    query.name = menuName;
  }
  return this.find(query);
};

// Middleware for menu items
MenuItemSchema.pre("save", function (this: IMenuItem, next) {
  // If dish is vegan, it's automatically vegetarian
  if (this.isVegan) {
    this.isVegetarian = true;
  }

  // If not spicy, remove spicy level
  if (!this.isSpicy) {
    this.spicyLevel = undefined;
  }

  // Check that spicyLevel is set for spicy dishes
  if (this.isSpicy && !this.spicyLevel) {
    this.spicyLevel = 1; // Set minimum level by default
  }

  next();
});

// Middleware for menu
MenuSchema.pre("save", async function (this: IMenu, next) {
  try {
    // Генерация slug если он не задан или изменилось название
    if (!this.slug || this.isModified("name")) {
      if (!this.name) {
        return next(new Error("Menu name is required to generate slug"));
      }

      const baseSlug = generateSlug(this.name);

      // Получаем существующие slug'и для данного ресторана
      const existingSlugs = await (this.constructor as any)
        .find(
          {
            restaurant: this.restaurant,
            _id: { $ne: this._id },
          },
          { slug: 1 }
        )
        .then((docs: any[]) => docs.map((doc: any) => doc.slug));

      this.slug = generateUniqueSlug(baseSlug, existingSlugs);
    }

    // Проверяем, что slug был сгенерирован
    if (!this.slug) {
      return next(new Error("Failed to generate menu slug"));
    }

    // Update lastUpdated timestamp
    this.lastUpdated = new Date();

    // Validate that section names are unique within the menu
    const sectionNames = this.sections.map((section) =>
      section.name.toLowerCase()
    );
    const uniqueSectionNames = new Set(sectionNames);

    if (sectionNames.length !== uniqueSectionNames.size) {
      return next(new Error("Section names must be unique within a menu"));
    }

    // Validate that category names are unique within each section
    for (const section of this.sections) {
      const categoryNames = section.categories.map((cat) =>
        cat.name.toLowerCase()
      );
      const uniqueCategoryNames = new Set(categoryNames);

      if (categoryNames.length !== uniqueCategoryNames.size) {
        return next(
          new Error(
            `Category names must be unique within section "${section.name}"`
          )
        );
      }
    }

    next();
  } catch (error) {
    next(error instanceof Error ? error : new Error("Unknown error occurred"));
  }
});

// Interface for static methods
export interface IMenuModel extends mongoose.Model<IMenu> {
  findByRestaurant(
    restaurantId: mongoose.Types.ObjectId
  ): mongoose.Query<IMenu[], IMenu>;
  findMenuByName(
    restaurantId: mongoose.Types.ObjectId,
    menuName: string
  ): mongoose.Query<IMenu | null, IMenu>;
  findMenuBySlug(
    restaurantId: mongoose.Types.ObjectId,
    menuSlug: string
  ): mongoose.Query<IMenu | null, IMenu>;
  findActiveMenus(): mongoose.Query<IMenu[], IMenu>;
  findBySection(
    restaurantId: mongoose.Types.ObjectId,
    sectionName: string,
    menuName?: string
  ): mongoose.Query<IMenu[], IMenu>;
  findByCategory(
    restaurantId: mongoose.Types.ObjectId,
    sectionName: string,
    categoryName: string,
    menuName?: string
  ): mongoose.Query<IMenu[], IMenu>;
  getSectionsForRestaurant(
    restaurantId: mongoose.Types.ObjectId,
    menuName?: string
  ): mongoose.Query<IMenu[], IMenu>;
  getCategoriesForSection(
    restaurantId: mongoose.Types.ObjectId,
    sectionName: string,
    menuName?: string
  ): mongoose.Query<IMenu[], IMenu>;
  searchMenuItems(
    restaurantId: mongoose.Types.ObjectId,
    searchTerm: string,
    menuName?: string
  ): mongoose.Query<IMenu[], IMenu>;
}

// Export model
export default (mongoose.models.Menu as IMenuModel) ||
  (mongoose.model<IMenu, IMenuModel>("Menu", MenuSchema) as IMenuModel);
