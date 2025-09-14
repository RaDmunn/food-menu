import mongoose, { Document, Schema } from "mongoose";

// Enum for user roles
export enum UserRole {
  ADMIN = "ADMIN",
  RESTAURANT_OWNER = "RESTAURANT_OWNER",
}

// Enum for user status
export enum UserStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  SUSPENDED = "suspended",
}

// Interface for user
export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  passwordSalt: string;
  phone?: string;
  role: UserRole;
  restaurants?: mongoose.Types.ObjectId[]; // References to restaurants for owners
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;
}

// Interface for User model with static methods
export interface IUserModel extends mongoose.Model<IUser> {
  findByEmail(email: string): Promise<IUser | null>;
  findActiveUsers(): Promise<IUser[]>;
  findByRole(role: UserRole): Promise<IUser[]>;
}

// User schema
const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email",
      ],
    },
    passwordHash: {
      type: String,
      required: [true, "Password hash is required"],
    },
    passwordSalt: {
      type: String,
      required: [true, "Password salt is required"],
    },
    phone: {
      type: String,
      trim: true,
      match: [/^[\+]?[1-9][\d]{0,15}$/, "Please enter a valid phone number"],
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      required: [true, "Role is required"],
      default: UserRole.RESTAURANT_OWNER,
    },
    restaurants: [
      {
        type: Schema.Types.ObjectId,
        ref: "Restaurant",
      },
    ],
    status: {
      type: String,
      enum: Object.values(UserStatus),
      default: UserStatus.ACTIVE,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for search optimization (email index is already created by unique: true)
UserSchema.index({ role: 1 });
UserSchema.index({ status: 1 });

// Middleware for constraint checking
UserSchema.pre("save", function (this: IUser, next) {
  // If role is not RestaurantOwner, clear restaurants array
  if (this.role !== UserRole.RESTAURANT_OWNER) {
    this.restaurants = [];
  }
  next();
});

// Virtual field for getting restaurant count
UserSchema.virtual("restaurantCount").get(function (this: IUser) {
  return this.restaurants ? this.restaurants.length : 0;
});

// Instance methods
UserSchema.methods.isAdmin = function () {
  return this.role === UserRole.ADMIN;
};

UserSchema.methods.isRestaurantOwner = function () {
  return this.role === UserRole.RESTAURANT_OWNER;
};

UserSchema.methods.isActive = function () {
  return this.status === UserStatus.ACTIVE;
};

// Static methods
UserSchema.statics.findByEmail = function (email: string) {
  return this.findOne({ email: email.toLowerCase() });
};

UserSchema.statics.findActiveUsers = function () {
  return this.find({ status: UserStatus.ACTIVE });
};

UserSchema.statics.findByRole = function (role: UserRole) {
  return this.find({ role });
};

// Export model with proper check
export default (mongoose.models.User ||
  mongoose.model<IUser, IUserModel>("User", UserSchema)) as IUserModel;
