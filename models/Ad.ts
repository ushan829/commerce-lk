import mongoose, { Document, Schema } from "mongoose";

export type AdType = "banner" | "native" | "sidebar";
export type AdPosition =
  | "home-hero"
  | "home-top"
  | "home-bottom"
  | "subject-top"
  | "subject-bottom"
  | "category-top"
  | "category-sidebar"
  | "resource-top"
  | "resource-sidebar"
  | "resource-bottom";

export interface IAd extends Document {
  title: string;
  type: AdType;
  position: string;
  imageUrl?: string;
  imageKey?: string;
  linkUrl?: string;
  altText?: string;
  htmlContent?: string;
  htmlCode?: string;
  nativeTitle?: string;
  nativeDescription?: string;
  nativeImage?: string;
  nativeImageKey?: string;
  targetSubjects: string[];
  targetCategories: string[];
  targetMediums: string[];
  isActive: boolean;
  startDate?: Date;
  endDate?: Date;
  order: number;
  clickCount: number;
  impressionCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const AdSchema = new Schema<IAd>(
  {
    title: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ["banner", "native", "sidebar"],
      required: true,
    },
    position: { type: String, required: true },
    imageUrl: { type: String },
    imageKey: { type: String },      // R2 object key for uploaded ad image
    linkUrl: { type: String },
    altText: { type: String },
    htmlContent: { type: String },
    htmlCode: { type: String },
    nativeTitle: { type: String },
    nativeDescription: { type: String },
    nativeImage: { type: String },
    nativeImageKey: { type: String }, // R2 object key for uploaded native image
    targetSubjects: [{ type: String }],
    targetCategories: [{ type: String }],
    targetMediums: [{ type: String }],
    isActive: { type: Boolean, default: true },
    startDate: { type: Date },
    endDate: { type: Date },
    order: { type: Number, default: 0 },
    clickCount: { type: Number, default: 0 },
    impressionCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

AdSchema.index({ position: 1, isActive: 1 });

export default mongoose.models.Ad || mongoose.model<IAd>("Ad", AdSchema);
