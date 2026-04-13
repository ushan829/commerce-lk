import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Subject from "@/models/Subject";
import Category from "@/models/Category";
import User from "@/models/User";
import { DEFAULT_SUBJECTS, DEFAULT_CATEGORIES } from "@/lib/utils";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as { role?: string }).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    for (const subject of DEFAULT_SUBJECTS) {
      await Subject.findOneAndUpdate(
        { slug: subject.slug },
        subject,
        { upsert: true, new: true }
      );
    }

    for (const category of DEFAULT_CATEGORIES) {
      await Category.findOneAndUpdate(
        { slug: category.slug },
        category,
        { upsert: true, new: true }
      );
    }

    return NextResponse.json({ message: "Database seeded successfully" });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Seed failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// Initial setup - creates first admin (only works if no admin exists)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const setupKey = searchParams.get("key");

    if (setupKey !== process.env.SETUP_KEY) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const adminExists = await User.findOne({ role: "admin" });
    if (adminExists) {
      return NextResponse.json({ message: "Admin already exists" });
    }

    if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) {
      return NextResponse.json(
        { error: "ADMIN_EMAIL and ADMIN_PASSWORD env variables are required" },
        { status: 500 }
      );
    }

    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    await User.create({
      name: "Admin",
      email: adminEmail,
      password: adminPassword,
      role: "admin",
      isVerified: true,
    });

    return NextResponse.json({
      message: "Admin created",
      email: adminEmail,
      note: "Change the password immediately after first login",
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Setup failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
