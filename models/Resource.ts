import mongoose, { Document, Schema } from "mongoose";

export type Medium = "sinhala" | "tamil" | "english";

export interface IResource extends Document {
  title: string;
  slug: string;
  subject: mongoose.Types.ObjectId;
  medium: Medium;
  category: mongoose.Types.ObjectId;
  fileUrl: string;
  fileKey: string;
  fileSize: number;
  fileType: string;
  thumbnail?: string;
  ogImage?: string;
  description?: string;
  seoTitle?: string;
  seoDescription?: string;
  tags?: string[];
  downloadCount: number;
  viewCount: number;
  ratingAvg: number;
  ratingCount: number;
  isActive: boolean;
  isFeatured: boolean;
  year?: number;
  term?: "1st" | "2nd" | "3rd";
  uploadedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ResourceSchema = new Schema<IResource>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    subject: {
      type: Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },
    medium: {
      type: String,
      enum: ["sinhala", "tamil", "english"],
      required: true,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    fileUrl: { type: String, required: true },
    fileKey: { type: String, required: true },
    fileSize: { type: Number, default: 0 },
    fileType: { type: String, default: "application/pdf" },
    thumbnail: { type: String },
    ogImage: { type: String },
    description: { type: String },
    seoTitle: { type: String },
    seoDescription: { type: String },
    tags: [{ type: String }],
    downloadCount: { type: Number, default: 0 },
    viewCount: { type: Number, default: 0 },
    ratingAvg: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    year: { type: Number },
    term: { type: String, enum: ["1st", "2nd", "3rd"] },
    uploadedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

ResourceSchema.index({ subject: 1, medium: 1, category: 1 });
ResourceSchema.index({ isActive: 1 });
ResourceSchema.index({ isFeatured: 1 });
ResourceSchema.index({ downloadCount: -1 });
ResourceSchema.index({ title: "text", description: "text", tags: "text" }, { weights: { title: 10, tags: 5, description: 1 } });

export default mongoose.models.Resource ||
  mongoose.model<IResource>("Resource", ResourceSchema);
