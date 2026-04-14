import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as { role?: string }).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const countOnly = searchParams.get("count") === "1";
    const type = searchParams.get("type") || "all";

    await dbConnect();

    const query: any = { isActive: true };
    if (type === "verified") query.isVerified = true;
    else if (type === "unverified") query.isVerified = false;

    if (countOnly) {
      const count = await User.countDocuments(query);
      return NextResponse.json({ count });
    }

    const users = await User.find()
      .select("-password -emailVerificationToken -emailVerificationExpiry -passwordResetToken -passwordResetExpiry")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ users: JSON.parse(JSON.stringify(users)) });
  } catch (error: unknown) {
    console.error('[API Error]:', error);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
