import mongoose, { Document, Schema } from "mongoose";

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

// Interface for menu item
export interface IMenuItem {
  name: string;
  description?: string;
  price: number;
  allergens?: Allergen[];
  isVegetarian?: boolean;
  isVegan?: boolean;
  isGlutenFree?: boolean;
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
  nutritionalInfo?: {
    protein?: number;
    carbs?: number;
    fat?: number;
    fiber?: number;
    sugar?: number;
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

// Interface for complete menu
export interface IMenu extends Document {
  restaurant: mongoose.Types.ObjectId; // Reference to restaurant
  name: string; // Menu name (e.g., "Breakfast Menu", "Dinner Menu", "Wine List")
  description?: string; // Optional menu description
  currency: string;
  categories: IMenuCategory[];
  isActive: boolean;
  lastUpdated: Date;
  createdAt: Date;
  updatedAt: Date;
}

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
    categories: [MenuCategorySchema],
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
MenuSchema.index({ restaurant: 1, isActive: 1 }); // Index for active menus per restaurant
MenuSchema.index({ isActive: 1 });
MenuSchema.index({ lastUpdated: -1 });
MenuSchema.index({ name: "text", description: "text" }); // Text search for menu names and descriptions
MenuSchema.index({ "categories.name": 1 });
MenuSchema.index({
  "categories.items.name": "text",
  "categories.items.description": "text",
});
MenuSchema.index({ "categories.items.price": 1 });
MenuSchema.index({ "categories.items.isVegetarian": 1 });
MenuSchema.index({ "categories.items.isVegan": 1 });
MenuSchema.index({ "categories.items.isPopular": 1 });

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

MenuSchema.statics.findActiveMenus = function () {
  return this.find({ isActive: true });
};

MenuSchema.statics.findByCategory = function (
  restaurantId: mongoose.Types.ObjectId,
  categoryName: string,
  menuName?: string
) {
  const query: any = { restaurant: restaurantId };
  if (menuName) {
    query.name = menuName;
  }
  return this.find(query, { "categories.$": 1 }, { "categories.name": categoryName });
};

MenuSchema.statics.getCategoriesForRestaurant = function (
  restaurantId: mongoose.Types.ObjectId,
  menuName?: string
) {
  const query: any = { restaurant: restaurantId };
  if (menuName) {
    query.name = menuName;
  }
  return this.find(query, {
    name: 1,
    "categories.name": 1,
    "categories.isActive": 1,
    "categories.sortOrder": 1,
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
      { "categories.items.name": new RegExp(searchTerm, "i") },
      { "categories.items.description": new RegExp(searchTerm, "i") },
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
MenuSchema.pre("save", function (this: IMenu, next) {
  // Update lastUpdated timestamp
  this.lastUpdated = new Date();

  // Validate that category names are unique within the menu
  const categoryNames = this.categories.map((cat) => cat.name.toLowerCase());
  const uniqueNames = new Set(categoryNames);

  if (categoryNames.length !== uniqueNames.size) {
    return next(new Error("Category names must be unique within a menu"));
  }

  next();
});

// Interface for static methods
export interface IMenuModel extends mongoose.Model<IMenu> {
  findByRestaurant(restaurantId: mongoose.Types.ObjectId): mongoose.Query<IMenu[], IMenu>;
  findMenuByName(restaurantId: mongoose.Types.ObjectId, menuName: string): mongoose.Query<IMenu | null, IMenu>;
  findActiveMenus(): mongoose.Query<IMenu[], IMenu>;
  findByCategory(restaurantId: mongoose.Types.ObjectId, categoryName: string, menuName?: string): mongoose.Query<IMenu[], IMenu>;
  getCategoriesForRestaurant(restaurantId: mongoose.Types.ObjectId, menuName?: string): mongoose.Query<IMenu[], IMenu>;
  searchMenuItems(restaurantId: mongoose.Types.ObjectId, searchTerm: string, menuName?: string): mongoose.Query<IMenu[], IMenu>;
}

// Export model
export default (mongoose.models.Menu as IMenuModel) ||
  (mongoose.model<IMenu, IMenuModel>("Menu", MenuSchema) as IMenuModel);
