import mongoose, { Schema } from "mongoose";

const ContactRequestSchema = new Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  email: { type: String, required: true, trim: true, lowercase: true, maxlength: 200 },
  phone: { type: String, trim: true, maxlength: 50 },
  restaurant: { type: String, trim: true, maxlength: 120 },
  message: { type: String, required: true, trim: true, maxlength: 2000 },
  status: { type: String, enum: ["new", "read"], default: "new" },
}, { timestamps: true });

export default mongoose.models.ContactRequest || mongoose.model("ContactRequest", ContactRequestSchema);
