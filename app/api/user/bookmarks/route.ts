import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Resource from "@/models/Resource";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const user = await User.findById((session.user as { id: string }).id)
      .select("bookmarks")
      .lean() as { bookmarks: string[] } | null;

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const resources = await Resource.find({ _id: { $in: user.bookmarks || [] } })
      .select("title slug subject medium category fileType fileSize thumbnail")
      .populate("subject", "name slug")
      .populate("category", "name")
      .lean();

    return NextResponse.json({ bookmarks: JSON.parse(JSON.stringify(resources)) });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch bookmarks";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const { resourceId } = await req.json();
    if (!resourceId) {
      return NextResponse.json({ error: "resourceId is required" }, { status: 400 });
    }

    await User.findByIdAndUpdate(
      (session.user as { id: string }).id,
      { $addToSet: { bookmarks: resourceId } }
    );

    return NextResponse.json({ message: "Bookmark added" });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to add bookmark";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
