import mongoose, { Document, Schema } from "mongoose";

export interface ISubject extends Document {
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  color?: string;
  order: number;
  isActive: boolean;
  seoTitle?: string;
  seoDescription?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SubjectSchema = new Schema<ISubject>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String },
    icon: { type: String },
    color: { type: String, default: "#10B981" },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    seoTitle: { type: String },
    seoDescription: { type: String },
  },
  { timestamps: true }
);

SubjectSchema.index({ order: 1 });

export default mongoose.models.Subject ||
  mongoose.model<ISubject>("Subject", SubjectSchema);
