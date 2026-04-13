import mongoose, { Document, Schema } from "mongoose";

export interface ISiteSetting extends Document {
  key: string;
  value: string;
  type: "text" | "image" | "boolean" | "json";
  group: string;
  label: string;
  updatedAt: Date;
}

const SiteSettingSchema = new Schema<ISiteSetting>(
  {
    key: { type: String, required: true, unique: true },
    value: { type: String, required: true },
    type: {
      type: String,
      enum: ["text", "image", "boolean", "json"],
      default: "text",
    },
    group: { type: String, default: "general" },
    label: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.models.SiteSetting ||
  mongoose.model<ISiteSetting>("SiteSetting", SiteSettingSchema);
