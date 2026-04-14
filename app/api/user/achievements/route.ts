import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Rating from "@/models/Rating";
import { calculateProfileCompletion } from "@/lib/profileCompletion";

function toDateStr(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await dbConnect();
    const userId = (session.user as { id: string }).id;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const user = await User.findById(userId)
      .select("downloadHistory bookmarks school isVerified profilePicture name phone district medium alYear stream gender dateOfBirth")
      .lean() as any;
    if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const history: { resourceId: string; downloadedAt: Date }[] = user.downloadHistory || [];
    const totalDownloads = history.length;
    const ratingsGiven = await Rating.countDocuments({ userId });

    // Streak
    const uniqueDates = [...new Set(history.map((h) => toDateStr(new Date(h.downloadedAt))))] as string[];
    uniqueDates.sort((a, b) => b.localeCompare(a));
    const now = new Date();
    const todayStr = toDateStr(now);
    const yest = new Date(now); yest.setDate(yest.getDate() - 1);
    const yestStr = toDateStr(yest);
    let streak = 0;
    if (uniqueDates.length > 0 && (uniqueDates[0] === todayStr || uniqueDates[0] === yestStr)) {
      let cur = new Date((uniqueDates[0] === todayStr ? todayStr : yestStr) + "T00:00:00");
      for (const d of uniqueDates) {
        if (d === toDateStr(cur)) { streak++; cur.setDate(cur.getDate() - 1); } else break;
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const completion = calculateProfileCompletion(user as any);

    const achievements = [
      {
        id: "first_download", name: "First Download",
        description: "Downloaded your first resource", emoji: "🎯",
        earned: totalDownloads >= 1,
        earnedAt: totalDownloads >= 1 ? history[0]?.downloadedAt : null,
      },
      {
        id: "bookworm", name: "Bookworm",
        description: "Downloaded 10+ resources", emoji: "📚",
        earned: totalDownloads >= 10,
      },
      {
        id: "critic", name: "Critic",
        description: "Rated 5+ resources", emoji: "⭐",
        earned: ratingsGiven >= 5,
      },
      {
        id: "on_fire", name: "On Fire",
        description: "7 consecutive day streak", emoji: "🔥",
        earned: streak >= 7,
      },
      {
        id: "school_pride", name: "School Pride",
        description: "Added your school name", emoji: "🏫",
        earned: !!user.school,
      },
      {
        id: "verified", name: "Verified",
        description: "Verified your email address", emoji: "✅",
        earned: !!user.isVerified,
      },
      {
        id: "complete", name: "Complete",
        description: "Reached 100% profile completion", emoji: "📝",
        earned: completion.percentage === 100,
      },
    ];

    return NextResponse.json({ achievements: JSON.parse(JSON.stringify(achievements)) });
  } catch (error: unknown) {
    console.error('[API Error]:', error);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
