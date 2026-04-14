import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Announcement from "@/models/Announcement";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as { role?: string }).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const announcements = await Announcement.find()
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ announcements: JSON.parse(JSON.stringify(announcements)) });
  } catch (error: unknown) {
    console.error('[API Error]:', error);
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
    const { message, type, isActive, link, linkText, dismissible, expiresAt } = body;

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

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

    return NextResponse.json({ success: true, announcement });
  } catch (error: unknown) {
    console.error('[API Error]:', error);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
