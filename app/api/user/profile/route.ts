import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const user = await User.findById((session.user as { id: string }).id)
      .select("-password -emailVerificationToken -emailVerificationExpiry -passwordResetToken -passwordResetExpiry")
      .lean();

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user: JSON.parse(JSON.stringify(user)) });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch profile";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const body = await req.json();

    // Whitelist updatable fields
    const allowed = ["name", "phone", "school", "district", "stream", "medium", "alYear", "gender", "dateOfBirth"];
    const updates: Record<string, unknown> = {};
    for (const key of allowed) {
      if (key in body) {
        let value = body[key];
        if (key === "alYear" && value) value = Number(value);
        if (key === "dateOfBirth" && value) value = new Date(value);
        updates[key] = value;
      }
    }

    const user = await User.findByIdAndUpdate(
      (session.user as { id: string }).id,
      { $set: updates },
      { new: true }
    ).select("-password -emailVerificationToken -emailVerificationExpiry -passwordResetToken -passwordResetExpiry");

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user: JSON.parse(JSON.stringify(user)), message: "Profile updated" });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update profile";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    await User.findByIdAndDelete((session.user as { id: string }).id);

    return NextResponse.json({ message: "Account deleted" });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to delete account";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
