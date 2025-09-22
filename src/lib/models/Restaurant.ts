import mongoose, { Document, Schema } from "mongoose";
import {
  CuisineType,
  RestaurantStatus,
  IWorkingHours,
  IAddress,
  IContact,
} from "@/lib/types";
import { generateSlug, generateUniqueSlug } from "@/lib/utils/slug";

// Экспортируем типы для обратной совместимости
export type {
  CuisineType,
  RestaurantStatus,
  IWorkingHours,
  IAddress,
  IContact,
};

// Интерфейс для ресторана
export interface IRestaurant extends Document {
  name: string;
  slug: string; // URL-friendly название для ссылок
  description?: string;
  owner: mongoose.Types.ObjectId; // Ссылка на пользователя-владельца
  address: IAddress;
  contact: IContact;
  cuisineType: CuisineType[];
  workingHours: IWorkingHours[];
  averageRating?: number;
  totalReviews?: number;
  priceRange?: {
    min: number;
    max: number;
    currency: string;
  };
  features?: string[]; // ['WiFi', 'Parking', 'Delivery', 'Takeout', etc.]
  images?: string[]; // URLs изображений
  status: RestaurantStatus;
  createdAt: Date;
  updatedAt: Date;
}

// Схема для часов работы
const WorkingHoursSchema = new Schema<IWorkingHours>({
  day: {
    type: String,
    required: true,
    enum: [
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
      "sunday",
    ],
  },
  open: {
    type: String,
    required: function () {
      return !this.isClosed;
    },
    match: [
      /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
      "Please enter time in HH:MM format",
    ],
  },
  close: {
    type: String,
    required: function () {
      return !this.isClosed;
    },
    match: [
      /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
      "Please enter time in HH:MM format",
    ],
  },
  isClosed: {
    type: Boolean,
    default: false,
  },
});

// Схема для адреса
const AddressSchema = new Schema<IAddress>({
  street: {
    type: String,
    required: [true, "Street address is required"],
    trim: true,
  },
  city: {
    type: String,
    required: [true, "City is required"],
    trim: true,
  },
  state: {
    type: String,
    trim: true,
  },
  zipCode: {
    type: String,
    trim: true,
  },
  country: {
    type: String,
    required: [true, "Country is required"],
    trim: true,
  },
  coordinates: {
    latitude: {
      type: Number,
      min: -90,
      max: 90,
    },
    longitude: {
      type: Number,
      min: -180,
      max: 180,
    },
  },
});

// Схема для контактов
const ContactSchema = new Schema<IContact>({
  phone: {
    type: String,
    trim: true,
    match: [/^[\+]?[1-9][\d]{0,15}$/, "Please enter a valid phone number"],
  },
  email: {
    type: String,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      "Please enter a valid email",
    ],
  },
  website: {
    type: String,
    trim: true,
  },
  socialMedia: {
    instagram: String,
    facebook: String,
    twitter: String,
  },
});

// Основная схема ресторана
const RestaurantSchema = new Schema<IRestaurant>(
  {
    name: {
      type: String,
      required: [true, "Restaurant name is required"],
      trim: true,
      maxlength: [100, "Restaurant name cannot exceed 100 characters"],
    },
    slug: {
      type: String,
      trim: true,
      lowercase: true,
      maxlength: [100, "Restaurant slug cannot exceed 100 characters"],
      match: [
        /^[a-z0-9]+(-[a-z0-9]+)*$/,
        "Slug must contain only lowercase letters, numbers, and hyphens",
      ],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Owner is required"],
    },
    address: {
      type: AddressSchema,
      required: [true, "Address is required"],
    },
    contact: {
      type: ContactSchema,
      required: [true, "Contact information is required"],
    },
    cuisineType: [
      {
        type: String,
        enum: Object.values(CuisineType),
        required: [true, "At least one cuisine type is required"],
      },
    ],
    workingHours: [WorkingHoursSchema],
    averageRating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    totalReviews: {
      type: Number,
      min: 0,
      default: 0,
    },
    priceRange: {
      min: {
        type: Number,
        min: 0,
      },
      max: {
        type: Number,
        min: 0,
      },
      currency: {
        type: String,
        default: "USD",
        maxlength: 3,
      },
    },
    features: [
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
      enum: Object.values(RestaurantStatus),
      default: RestaurantStatus.PENDING,
    },
  },
  {
    timestamps: true,
  }
);

// Индексы для оптимизации поиска
RestaurantSchema.index({ name: "text", description: "text" });
RestaurantSchema.index({ slug: 1 }, { unique: true });
RestaurantSchema.index({ owner: 1 });
RestaurantSchema.index({ status: 1 });
RestaurantSchema.index({ cuisineType: 1 });
RestaurantSchema.index({ averageRating: -1 });
RestaurantSchema.index({ "address.city": 1 });
RestaurantSchema.index({ "address.coordinates": "2dsphere" });

// Виртуальные поля
RestaurantSchema.virtual("fullAddress").get(function () {
  const addr = this.address;
  return `${
    addr.street
  }, ${addr.city}${addr.state ? ", " + addr.state : ""}, ${addr.country}`;
});

// Методы экземпляра
RestaurantSchema.methods.isActive = function () {
  return this.status === RestaurantStatus.ACTIVE;
};

RestaurantSchema.methods.updateRating = function (newRating: number) {
  const totalRating = this.averageRating * this.totalReviews + newRating;
  this.totalReviews += 1;
  this.averageRating = totalRating / this.totalReviews;
  return this.save();
};

// Статические методы
RestaurantSchema.statics.findByOwner = function (
  ownerId: mongoose.Types.ObjectId
) {
  return this.find({ owner: ownerId });
};

RestaurantSchema.statics.findByCity = function (city: string) {
  return this.find({ "address.city": new RegExp(city, "i") });
};

RestaurantSchema.statics.findByCuisine = function (cuisineType: CuisineType) {
  return this.find({ cuisineType: cuisineType });
};

RestaurantSchema.statics.findActiveRestaurants = function () {
  return this.find({ status: RestaurantStatus.ACTIVE });
};

RestaurantSchema.statics.findBySlug = function (slug: string) {
  return this.findOne({ slug: slug });
};

// Middleware
RestaurantSchema.pre("save", async function (next) {
  try {
    // Генерация slug если он не задан или изменилось название
    if (!this.slug || this.isModified("name")) {
      if (!this.name) {
        return next(new Error("Restaurant name is required to generate slug"));
      }

      const baseSlug = generateSlug(this.name);

      // Получаем существующие slug'и для проверки уникальности
      const existingSlugs = await (this.constructor as any)
        .find({ _id: { $ne: this._id } }, { slug: 1 })
        .then((docs: any[]) => docs.map((doc: any) => doc.slug));

      this.slug = generateUniqueSlug(baseSlug, existingSlugs);
    }

    // Проверяем, что slug был сгенерирован
    if (!this.slug) {
      return next(new Error("Failed to generate restaurant slug"));
    }

    // Валидация ценового диапазона
    if (this.priceRange && this.priceRange.min > this.priceRange.max) {
      return next(
        new Error("Minimum price cannot be greater than maximum price")
      );
    }

    next();
  } catch (error) {
    next(error instanceof Error ? error : new Error("Unknown error occurred"));
  }
});

// Interface for static methods
export interface IRestaurantModel extends mongoose.Model<IRestaurant> {
  findByOwner(
    ownerId: mongoose.Types.ObjectId
  ): mongoose.Query<IRestaurant[], IRestaurant>;
  findByCity(city: string): mongoose.Query<IRestaurant[], IRestaurant>;
  findByCuisine(
    cuisineType: CuisineType
  ): mongoose.Query<IRestaurant[], IRestaurant>;
  findActiveRestaurants(): mongoose.Query<IRestaurant[], IRestaurant>;
  findBySlug(slug: string): mongoose.Query<IRestaurant | null, IRestaurant>;
}

// Экспорт модели
export default (mongoose.models.Restaurant as IRestaurantModel) ||
  (mongoose.model<IRestaurant, IRestaurantModel>(
    "Restaurant",
    RestaurantSchema
  ) as IRestaurantModel);
