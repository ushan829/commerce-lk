import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Resource from "@/models/Resource";
import Rating from "@/models/Rating";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await dbConnect();
    const userId = (session.user as { id: string }).id;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const user = await User.findById(userId).select("downloadHistory").lean() as any;
    if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const history: { resourceId: string; downloadedAt: Date }[] = (user.downloadHistory || []).slice(-20);
    const dlResourceIds = history.map((h) => h.resourceId);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dlResources = await Resource.find({ _id: { $in: dlResourceIds } })
      .select("title slug subject medium category")
      .populate("subject", "name slug")
      .populate("category", "name slug")
      .lean() as any[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dlMap = new Map(dlResources.map((r: any) => [r._id.toString(), r]));

    const downloadActivities = [...history]
      .reverse()
      .filter((h) => dlMap.get(h.resourceId))
      .map((h) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const r = dlMap.get(h.resourceId) as any;
        return {
          type: "download",
          title: r.title,
          timestamp: h.downloadedAt,
          subjectSlug: r.subject?.slug,
          medium: r.medium,
          categorySlug: r.category?.slug,
          resourceSlug: r.slug,
        };
      });

    // Ratings
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ratings = await Rating.find({ userId }).sort({ updatedAt: -1 }).limit(10).lean() as any[];
    const ratingResourceIds = ratings.map((r) => r.resourceId);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ratingResources = await Resource.find({ _id: { $in: ratingResourceIds } })
      .select("title slug subject medium category")
      .populate("subject", "name slug")
      .populate("category", "name slug")
      .lean() as any[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rMap = new Map(ratingResources.map((r: any) => [r._id.toString(), r]));

    const ratingActivities = ratings
      .filter((r) => rMap.get(r.resourceId))
      .map((r) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const res = rMap.get(r.resourceId) as any;
        return {
          type: "rating",
          title: res.title,
          timestamp: r.updatedAt,
          rating: r.rating,
          subjectSlug: res.subject?.slug,
          medium: res.medium,
          categorySlug: res.category?.slug,
          resourceSlug: res.slug,
        };
      });

    const all = [...downloadActivities, ...ratingActivities]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10);

    return NextResponse.json({ activities: JSON.parse(JSON.stringify(all)) });
  } catch (error: unknown) {
    console.error('[API Error]:', error);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
