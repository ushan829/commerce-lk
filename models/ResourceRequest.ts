import mongoose, { Document, Schema } from "mongoose";

export type RequestStatus = "pending" | "fulfilled" | "rejected";

export interface IResourceRequest extends Document {
  userId: string;
  userName: string;
  userEmail: string;
  subject: string;
  medium: string;
  category: string;
  title: string;
  year?: number;
  notes?: string;
  status: RequestStatus;
  adminNote?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ResourceRequestSchema = new Schema<IResourceRequest>(
  {
    userId: { type: String, required: true },
    userName: { type: String, required: true },
    userEmail: { type: String, required: true },
    subject: { type: String, required: true },
    medium: { type: String, required: true, enum: ["sinhala", "tamil", "english"] },
    category: { type: String, required: true },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    year: { type: Number },
    notes: { type: String, maxlength: 1000, trim: true },
    status: { type: String, enum: ["pending", "fulfilled", "rejected"], default: "pending" },
    adminNote: { type: String, maxlength: 500 },
  },
  { timestamps: true }
);

ResourceRequestSchema.index({ userId: 1 });
ResourceRequestSchema.index({ status: 1 });
ResourceRequestSchema.index({ createdAt: -1 });

export default mongoose.models.ResourceRequest ||
  mongoose.model<IResourceRequest>("ResourceRequest", ResourceRequestSchema);
