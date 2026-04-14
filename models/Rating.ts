import mongoose, { Document, Schema } from "mongoose";

export interface IRating extends Document {
  userId: mongoose.Types.ObjectId;
  resourceId: mongoose.Types.ObjectId;
  rating: number;
  comment?: string;
  flagged: boolean;
  adminNote?: string;
  createdAt: Date;
  updatedAt: Date;
}

const RatingSchema = new Schema<IRating>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    resourceId: { type: Schema.Types.ObjectId, ref: "Resource", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, maxlength: 500, trim: true },
    flagged: { type: Boolean, default: false },
    adminNote: { type: String, default: "" },
  },
  { timestamps: true }
);

// One rating per user per resource
RatingSchema.index({ userId: 1, resourceId: 1 }, { unique: true });
RatingSchema.index({ resourceId: 1 });
RatingSchema.index({ flagged: 1 });

export default mongoose.models.Rating ||
  mongoose.model<IRating>("Rating", RatingSchema);
