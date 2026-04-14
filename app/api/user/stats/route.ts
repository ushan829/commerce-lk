import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Resource from "@/models/Resource";
import Rating from "@/models/Rating";

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
    const user = await User.findById(userId).select("downloadHistory bookmarks").lean() as any;
    if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Touch lastActive
    await User.findByIdAndUpdate(userId, { lastActive: new Date() });

    const history: { resourceId: string; downloadedAt: Date }[] = user.downloadHistory || [];
    const totalDownloads = history.length;

    // Monthly downloads
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthlyDownloads = history.filter((h) => new Date(h.downloadedAt) >= monthStart).length;

    // Unique days (descending)
    const uniqueDates = [...new Set(history.map((h) => toDateStr(new Date(h.downloadedAt))))] as string[];
    uniqueDates.sort((a, b) => b.localeCompare(a));
    const daysActive = uniqueDates.length;

    // Streak
    let streak = 0;
    if (uniqueDates.length > 0) {
      const todayStr = toDateStr(now);
      const yest = new Date(now); yest.setDate(yest.getDate() - 1);
      const yestStr = toDateStr(yest);
      const startsToday = uniqueDates[0] === todayStr;
      const startsYest = uniqueDates[0] === yestStr;
      if (startsToday || startsYest) {
        let cur = new Date((startsToday ? todayStr : yestStr) + "T00:00:00");
        for (const d of uniqueDates) {
          if (d === toDateStr(cur)) {
            streak++;
            cur.setDate(cur.getDate() - 1);
          } else break;
        }
      }
    }

    // Rank
    let rank = "Bronze";
    if (totalDownloads >= 100) rank = "Platinum";
    else if (totalDownloads >= 51) rank = "Gold";
    else if (totalDownloads >= 11) rank = "Silver";

    const bookmarkCount = (user.bookmarks || []).length;
    const ratingsGiven = await Rating.countDocuments({ userId });

    // Subject stats
    let mostDownloadedSubject: string | null = null;
    let currentlyStudying: string | null = null;

    if (totalDownloads > 0) {
      const resourceIds = history.map((h) => h.resourceId);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const resources = await Resource.find({ _id: { $in: resourceIds } })
        .select("_id subject")
        .populate("subject", "name")
        .lean() as any[];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rMap = new Map(resources.map((r: any) => [r._id.toString(), r]));

      // Currently studying = most recent download's subject
      for (let i = history.length - 1; i >= 0; i--) {
        const r = rMap.get(history[i].resourceId);
        if (r?.subject?.name) { currentlyStudying = r.subject.name; break; }
      }

      // Most downloaded subject
      const counts: Record<string, number> = {};
      for (const h of history) {
        const r = rMap.get(h.resourceId);
        if (r?.subject?.name) counts[r.subject.name] = (counts[r.subject.name] || 0) + 1;
      }
      const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
      if (sorted.length) mostDownloadedSubject = sorted[0][0];
    }

    return NextResponse.json({
      totalDownloads, monthlyDownloads, bookmarkCount,
      daysActive, streak, ratingsGiven, rank,
      mostDownloadedSubject, currentlyStudying,
    });
  } catch (error: unknown) {
    console.error('[API Error]:', error);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
