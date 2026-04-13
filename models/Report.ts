import mongoose, { Document, Schema } from "mongoose";

export type ReportReason =
  | "broken-file"
  | "wrong-content"
  | "incorrect-year"
  | "duplicate"
  | "other";

export type ReportStatus = "pending" | "reviewed";

export interface IReport extends Document {
  resourceSlug: string;
  resourceTitle: string;
  subjectName?: string;
  reason: ReportReason;
  description?: string;
  reporterEmail?: string;
  status: ReportStatus;
  adminNote?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ReportSchema = new Schema<IReport>(
  {
    resourceSlug:  { type: String, required: true },
    resourceTitle: { type: String, required: true },
    subjectName:   { type: String },
    reason: {
      type: String,
      enum: ["broken-file", "wrong-content", "incorrect-year", "duplicate", "other"],
      required: true,
    },
    description:   { type: String, maxlength: 1000, trim: true },
    reporterEmail: { type: String, trim: true },
    status: {
      type: String,
      enum: ["pending", "reviewed"],
      default: "pending",
    },
    adminNote: { type: String, maxlength: 500, trim: true },
  },
  { timestamps: true }
);

ReportSchema.index({ status: 1 });
ReportSchema.index({ resourceSlug: 1 });
ReportSchema.index({ createdAt: -1 });

export default mongoose.models.Report ||
  mongoose.model<IReport>("Report", ReportSchema);
