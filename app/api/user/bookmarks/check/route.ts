import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ bookmarked: false });
    }

    const resourceId = new URL(req.url).searchParams.get("resourceId");
    if (!resourceId) {
      return NextResponse.json({ bookmarked: false });
    }

    await dbConnect();
    const user = await User.findById((session.user as { id: string }).id)
      .select("bookmarks")
      .lean() as { bookmarks: string[] } | null;

    const bookmarked = user?.bookmarks?.includes(resourceId) ?? false;
    return NextResponse.json({ bookmarked });
  } catch {
    return NextResponse.json({ bookmarked: false });
  }
}
