import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import ContactRequest from "@/lib/models/ContactRequest";
import { requireAdmin } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rateLimit";

export async function GET(request: NextRequest) {
  if (!await requireAdmin(request)) return NextResponse.json({ error: "Access denied" }, { status: 403 });
  await dbConnect();
  const page = Math.max(1, Number(new URL(request.url).searchParams.get("page")) || 1);
  const limit = 200;
  const [requests, total] = await Promise.all([ContactRequest.find().sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(), ContactRequest.countDocuments()]);
  return NextResponse.json({ requests, pagination: { page, pages: Math.ceil(total / limit), total } });
}

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || request.headers.get("x-real-ip") || "unknown";
    if (!checkRateLimit(`contact:${ip}`).allowed) return NextResponse.json({ error: "Too many requests. Please try later." }, { status: 429 });
    const input = await request.json();
    if (input.website) return NextResponse.json({ message: "Thank you. Your message has been received." }, { status: 201 });
    const name = String(input.name || "").trim();
    const email = String(input.email || "").trim();
    const message = String(input.message || "").trim();
    if (!name || name.length > 100 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 200 || !message || message.length > 2000) {
      return NextResponse.json({ error: "Please check your name, email and message." }, { status: 400 });
    }
    await dbConnect();
    await ContactRequest.create({ name, email, message, phone: String(input.phone || "").slice(0, 50), restaurant: String(input.restaurant || "").slice(0, 120) });
    return NextResponse.json({ message: "Thank you. Your message has been received." }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Could not send your message." }, { status: 500 });
  }
}
