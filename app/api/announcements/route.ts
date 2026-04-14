import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Announcement from "@/models/Announcement";

export async function GET() {
  try {
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

    return NextResponse.json({ announcements: JSON.parse(JSON.stringify(announcements)) });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch announcements";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
