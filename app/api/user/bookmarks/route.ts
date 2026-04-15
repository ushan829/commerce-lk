import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Resource from "@/models/Resource";
import Subject from "@/models/Subject";
import Category from "@/models/Category";

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
    console.error('[API Error]:', error);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
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
    console.error('[API Error]:', error);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
