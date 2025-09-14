import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { NextRequest } from "next/server";
import dbConnect from "./dbConnect";
import User, { IUser, UserRole, UserStatus } from "./models/User";

const JWT_SECRET = process.env.NEXTAUTH_SECRET || "your-secret-key";

// Interface for JWT payload
export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
  name: string;
}

// Generate salt and hash password
export async function hashPasswordWithSalt(
  password: string
): Promise<{ hash: string; salt: string }> {
  const saltRounds = 12;
  const salt = await bcrypt.genSalt(saltRounds);
  const hash = await bcrypt.hash(password, salt);

  // Extract just the salt part (first 29 characters of bcrypt hash contain salt info)
  const saltOnly = salt;

  return { hash, salt: saltOnly };
}

// Verify password with stored hash and salt
export async function verifyPassword(
  password: string,
  storedHash: string,
  storedSalt: string
): Promise<boolean> {
  const hash = await bcrypt.hash(password, storedSalt);
  return hash === storedHash;
}

// Create JWT token
export function createToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

// Verify JWT token
export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    return null;
  }
}

// Get token from request headers
export function getTokenFromRequest(request: NextRequest): string | null {
  const authHeader = request.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.substring(7);
  }
  return null;
}

// Get user from token
export async function getUserFromToken(token: string): Promise<IUser | null> {
  const payload = verifyToken(token);
  if (!payload) return null;

  await dbConnect();
  const user = await User.findById(payload.userId);
  return user;
}

// Middleware for authentication check
export async function requireAuth(request: NextRequest): Promise<IUser | null> {
  const token = getTokenFromRequest(request);
  if (!token) return null;

  return await getUserFromToken(token);
}

// Middleware for admin role check
export async function requireAdmin(
  request: NextRequest
): Promise<IUser | null> {
  const user = await requireAuth(request);
  if (!user || user.role !== UserRole.ADMIN) return null;
  return user;
}

// Middleware for restaurant owner role check
export async function requireRestaurantOwner(
  request: NextRequest
): Promise<IUser | null> {
  const user = await requireAuth(request);
  if (!user || user.role !== UserRole.RESTAURANT_OWNER) return null;
  return user;
}

// Middleware for admin or restaurant owner role check
export async function requireAdminOrOwner(
  request: NextRequest
): Promise<IUser | null> {
  const user = await requireAuth(request);
  if (
    !user ||
    (user.role !== UserRole.ADMIN && user.role !== UserRole.RESTAURANT_OWNER)
  )
    return null;
  return user;
}

// Create new user
export async function createUser(userData: {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role?: UserRole;
}): Promise<IUser> {
  await dbConnect();

  // Check if user with this email already exists
  const existingUser = await User.findByEmail(userData.email);
  if (existingUser) {
    throw new Error("User with this email already exists");
  }

  // Hash password with salt
  const { hash, salt } = await hashPasswordWithSalt(userData.password);

  // Create user
  const user = new User({
    name: userData.name,
    email: userData.email,
    passwordHash: hash,
    passwordSalt: salt,
    phone: userData.phone,
    role: userData.role || UserRole.RESTAURANT_OWNER,
    status: UserStatus.ACTIVE,
  });

  return await user.save();
}

// Authenticate user
export async function authenticateUser(
  email: string,
  password: string
): Promise<{
  user: IUser;
  token: string;
} | null> {
  await dbConnect();

  // Find user by email
  const user = await User.findByEmail(email);
  if (!user) return null;

  // Check user status
  if (user.status !== UserStatus.ACTIVE) {
    throw new Error("User account is not active");
  }

  // Verify password
  const isValidPassword = await verifyPassword(
    password,
    user.passwordHash,
    user.passwordSalt
  );
  if (!isValidPassword) return null;

  // Create token
  const token = createToken({
    userId: (user._id as mongoose.Types.ObjectId).toString(),
    email: user.email,
    role: user.role,
    name: user.name,
  });

  return { user, token };
}

// Check restaurant access permissions
export async function canAccessRestaurant(
  user: IUser,
  restaurantId: string
): Promise<boolean> {
  // Admin has access to all restaurants
  if (user.role === UserRole.ADMIN) return true;

  // Restaurant owner has access only to their restaurants
  if (user.role === UserRole.RESTAURANT_OWNER) {
    return (
      user.restaurants?.some((id) => id.toString() === restaurantId) || false
    );
  }

  return false;
}
