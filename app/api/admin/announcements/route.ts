import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Announcement from "@/models/Announcement";
import { validateInput, announcementSchema } from "@/lib/validations";
import redis from "@/lib/redis";

const CACHE_KEY = 'admin:announcements';
const PUBLIC_CACHE_KEY = 'public:announcements';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as { role?: string }).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const cached = await redis.get(CACHE_KEY);
    if (cached) {
      return NextResponse.json(cached);
    }

    await dbConnect();
    const announcements = await Announcement.find({})
      .sort({ createdAt: -1 })
      .lean();

    const result = { announcements: JSON.parse(JSON.stringify(announcements)) };
    await redis.set(CACHE_KEY, result, { ex: 60 });

    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error('[Admin Announcements GET]:', error);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as { role?: string }).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validation = validateInput(announcementSchema, body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const { message, type, isActive, link, linkText, dismissible, expiresAt } = validation.data!;

    await dbConnect();
    const announcement = await Announcement.create({
      message,
      type: type || 'info',
      isActive: isActive !== undefined ? isActive : true,
      link: link || '',
      linkText: linkText || '',
      dismissible: dismissible !== undefined ? dismissible : true,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      createdBy: (session.user as { id: string }).id
    });

    // Invalidate caches
    await redis.del(CACHE_KEY);
    await redis.del(PUBLIC_CACHE_KEY);

    return NextResponse.json({ success: true, announcement });
  } catch (error: unknown) {
    console.error('[API Error]:', error);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
