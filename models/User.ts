import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: "student" | "admin";
  avatar?: string;
  isVerified: boolean;
  // Extended profile fields
  phone?: string;
  school?: string;
  district?: string;
  stream?: string;
  medium?: string;
  alYear?: number;
  gender?: string;
  dateOfBirth?: Date;
  // Auth tokens
  emailVerificationToken?: string;
  emailVerificationExpiry?: Date;
  passwordResetToken?: string;
  passwordResetExpiry?: Date;
  // Profile picture
  profilePicture?: string;
  // Activity
  bookmarks: string[];
  downloadHistory: { resourceId: string; downloadedAt: Date }[];
  lastActive?: Date;
  isActive: boolean;
  // Preferences
  notifications?: {
    newResources: boolean;
    weeklyTips: boolean;
    examReminders: boolean;
  };
  subscribedSubjects?: string[]; // subject slugs; empty = all subjects
  showProfile?: boolean;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(password: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, minlength: 6 },
    role: { type: String, enum: ["student", "admin"], default: "student" },
    avatar: { type: String },
    isVerified: { type: Boolean, default: false },
    // Extended profile
    phone: { type: String, trim: true },
    school: { type: String, trim: true },
    district: { type: String },
    stream: { type: String },
    medium: { type: String, enum: ["sinhala", "tamil", "english"] },
    alYear: { type: Number },
    gender: { type: String, enum: ["male", "female", "other"] },
    dateOfBirth: { type: Date },
    // Auth tokens
    emailVerificationToken: { type: String },
    emailVerificationExpiry: { type: Date },
    passwordResetToken: { type: String },
    passwordResetExpiry: { type: Date },
    // Profile picture (R2 URL)
    profilePicture: { type: String },
    // Activity
    bookmarks: [{ type: String }],
    downloadHistory: [
      {
        resourceId: { type: String },
        downloadedAt: { type: Date, default: Date.now },
      },
    ],
    lastActive: { type: Date },
    isActive: { type: Boolean, default: true },
    notifications: {
      newResources: { type: Boolean, default: true },
      weeklyTips: { type: Boolean, default: true },
      examReminders: { type: Boolean, default: true },
    },
    showProfile: { type: Boolean, default: true },
    subscribedSubjects: [{ type: String }],
  },
  { timestamps: true }
);

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

UserSchema.methods.comparePassword = async function (password: string) {
  return bcrypt.compare(password, this.password);
};

export default mongoose.models.User ||
  mongoose.model<IUser>("User", UserSchema);
