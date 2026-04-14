import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Announcement from "@/models/Announcement";
import redis from "@/lib/redis";

const CACHE_KEY = 'public:announcements';

export async function GET() {
  try {
    const cached = await redis.get(CACHE_KEY);
    if (cached) {
      return NextResponse.json(cached);
    }

    await dbConnect();
    const now = new Date();
    
    const announcements = await Announcement.find({
      isActive: true,
      $or: [
        { expiresAt: null },
        { expiresAt: { $gt: now } }
      ]
    })
    .sort({ createdAt: -1 })
    .lean();

    const result = { announcements: JSON.parse(JSON.stringify(announcements)) };
    await redis.set(CACHE_KEY, result, { ex: 300 }); // cache 5 minutes

    return NextResponse.json(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch announcements";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
