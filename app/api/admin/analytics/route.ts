import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Resource from "@/models/Resource";
import User from "@/models/User";
import ResourceRequest from "@/models/ResourceRequest";
import Report from "@/models/Report";

function monthLabel(year: number, month: number) {
  return new Date(year, month - 1, 1).toLocaleString("en-US", { month: "short", year: "2-digit" });
}

function last6MonthBuckets() {
  const buckets: { year: number; month: number; label: string }[] = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    buckets.push({ year: d.getFullYear(), month: d.getMonth() + 1, label: monthLabel(d.getFullYear(), d.getMonth() + 1) });
  }
  return buckets;
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as { role?: string }).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const [
      resourcesBySubjectRaw,
      resourcesByCategoryRaw,
      resourcesByMediumRaw,
      topResourcesRaw,
      usersByMonthRaw,
      resourcesByMonthRaw,
      totalStats,
      requestStats,
      pendingReports,
    ] = await Promise.all([
      // Downloads + count grouped by subject
      Resource.aggregate([
        { $match: { isActive: true } },
        { $lookup: { from: "subjects", localField: "subject", foreignField: "_id", as: "subjectDoc" } },
        { $unwind: "$subjectDoc" },
        { $group: {
          _id:       "$subjectDoc._id",
          name:      { $first: "$subjectDoc.name" },
          color:     { $first: "$subjectDoc.color" },
          count:     { $sum: 1 },
          downloads: { $sum: "$downloadCount" },
          views:     { $sum: "$viewCount" },
        }},
        { $sort: { downloads: -1 } },
      ]),

      // Count grouped by category (top 10)
      Resource.aggregate([
        { $match: { isActive: true } },
        { $lookup: { from: "categories", localField: "category", foreignField: "_id", as: "catDoc" } },
        { $unwind: "$catDoc" },
        { $group: {
          _id:   "$catDoc._id",
          name:  { $first: "$catDoc.name" },
          count: { $sum: 1 },
          downloads: { $sum: "$downloadCount" },
        }},
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),

      // Count by medium
      Resource.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: "$medium", count: { $sum: 1 }, downloads: { $sum: "$downloadCount" } } },
        { $sort: { count: -1 } },
      ]),

      // Top 10 most downloaded
      Resource.find({ isActive: true })
        .populate("subject", "name color")
        .populate("category", "name")
        .sort({ downloadCount: -1 })
        .limit(10)
        .select("title slug downloadCount viewCount ratingAvg medium year")
        .lean(),

      // Users registered per month (last 6)
      User.aggregate([
        { $match: { createdAt: { $gte: sixMonthsAgo }, role: "student" } },
        { $group: {
          _id:   { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
          count: { $sum: 1 },
        }},
        { $sort: { "_id.year": 1, "_id.month": 1 } },
      ]),

      // Resources uploaded per month (last 6)
      Resource.aggregate([
        { $match: { createdAt: { $gte: sixMonthsAgo }, isActive: true } },
        { $group: {
          _id:   { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
          count: { $sum: 1 },
        }},
        { $sort: { "_id.year": 1, "_id.month": 1 } },
      ]),

      // Total stats
      Promise.all([
        Resource.countDocuments({ isActive: true }),
        User.countDocuments({ role: "student", isActive: true }),
        Resource.aggregate([{ $group: { _id: null, total: { $sum: "$downloadCount" }, views: { $sum: "$viewCount" } } }]),
        Resource.aggregate([{ $group: { _id: null, avgRating: { $avg: "$ratingAvg" }, totalRatings: { $sum: "$ratingCount" } } }]),
      ]),

      // Request stats
      Promise.all([
        ResourceRequest.countDocuments({ status: "pending" }),
        ResourceRequest.countDocuments({ status: "fulfilled" }),
        ResourceRequest.countDocuments({ status: "rejected" }),
      ]),

      // Pending reports
      Report.countDocuments({ status: "pending" }),
    ]);

    // Map monthly aggregations to buckets
    const buckets = last6MonthBuckets();

    const mapMonthly = (raw: { _id: { year: number; month: number }; count: number }[]) =>
      buckets.map(b => {
        const found = raw.find(r => r._id.year === b.year && r._id.month === b.month);
        return { label: b.label, count: found?.count || 0 };
      });

    const [totalResources, totalUsers, dlAgg, ratingAgg] = totalStats;
    const [pendingReqs, fulfilledReqs, rejectedReqs] = requestStats;

    return NextResponse.json({
      overview: {
        totalResources,
        totalUsers,
        totalDownloads: dlAgg[0]?.total || 0,
        totalViews:     dlAgg[0]?.views || 0,
        avgRating:      ratingAgg[0]?.avgRating || 0,
        totalRatings:   ratingAgg[0]?.totalRatings || 0,
        pendingRequests: pendingReqs,
        fulfilledRequests: fulfilledReqs,
        rejectedRequests: rejectedReqs,
        pendingReports,
      },
      resourcesBySubject:   JSON.parse(JSON.stringify(resourcesBySubjectRaw)),
      resourcesByCategory:  JSON.parse(JSON.stringify(resourcesByCategoryRaw)),
      resourcesByMedium:    JSON.parse(JSON.stringify(resourcesByMediumRaw)),
      topResources:         JSON.parse(JSON.stringify(topResourcesRaw)),
      usersByMonth:         mapMonthly(usersByMonthRaw),
      resourcesByMonth:     mapMonthly(resourcesByMonthRaw),
    });
  } catch (err) {
    console.error("Analytics error:", err);
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
  }
}
