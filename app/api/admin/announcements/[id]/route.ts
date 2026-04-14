import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Announcement from "@/models/Announcement";
import redis from "@/lib/redis";

const CACHE_KEY = 'admin:announcements';
const PUBLIC_CACHE_KEY = 'public:announcements';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as { role?: string }).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();

    await dbConnect();
    const announcement = await Announcement.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true }
    );

    if (!announcement) {
      return NextResponse.json({ error: "Announcement not found" }, { status: 404 });
    }

    // Invalidate caches
    await redis.del(CACHE_KEY);
    await redis.del(PUBLIC_CACHE_KEY);

    return NextResponse.json({ success: true, announcement });
  } catch (error: unknown) {
    console.error('[API Error]:', error);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as { role?: string }).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    await dbConnect();
    const announcement = await Announcement.findByIdAndDelete(id);

    if (!announcement) {
      return NextResponse.json({ error: "Announcement not found" }, { status: 404 });
    }

    // Invalidate caches
    await redis.del(CACHE_KEY);
    await redis.del(PUBLIC_CACHE_KEY);

    return NextResponse.json({ success: true, message: "Announcement deleted" });
  } catch (error: unknown) {
    console.error('[API Error]:', error);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
