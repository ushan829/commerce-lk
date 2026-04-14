import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await dbConnect();
    const userId = (session.user as { id: string }).id;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const user = await User.findById(userId).select("notifications showProfile").lean() as any;
    if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const notifications = user.notifications || { newResources: true, weeklyTips: true, examReminders: true };
    const showProfile = user.showProfile !== false;
    const subscribedSubjects: string[] = user.subscribedSubjects || [];

    return NextResponse.json({ notifications, showProfile, subscribedSubjects });
  } catch (error: unknown) {
    console.error('[API Error]:', error);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await dbConnect();
    const userId = (session.user as { id: string }).id;
    const { notifications, showProfile, subscribedSubjects } = await req.json();

    await User.findByIdAndUpdate(userId, {
      ...(notifications && { notifications }),
      ...(showProfile !== undefined && { showProfile }),
      ...(Array.isArray(subscribedSubjects) && { subscribedSubjects }),
    });
    return NextResponse.json({ message: "Saved" });
  } catch (error: unknown) {
    console.error('[API Error]:', error);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
