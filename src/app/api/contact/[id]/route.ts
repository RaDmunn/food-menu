import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/dbConnect";
import ContactRequest from "@/lib/models/ContactRequest";
import { requireAdmin } from "@/lib/auth";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await requireAdmin(request)) return NextResponse.json({ error: "Access denied" }, { status: 403 });
  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  const { status } = await request.json();
  if (status !== "new" && status !== "read") return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  await dbConnect();
  const contactRequest = await ContactRequest.findByIdAndUpdate(id, { status }, { new: true });
  if (!contactRequest) return NextResponse.json({ error: "Request not found" }, { status: 404 });
  return NextResponse.json({ request: contactRequest });
}
