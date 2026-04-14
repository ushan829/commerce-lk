import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Subject from "@/models/Subject";
import Category from "@/models/Category";
import Resource from "@/models/Resource";
import User from "@/models/User";
import Ad from "@/models/Ad";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as { role?: string }).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const [
      totalSubjects,
      totalCategories,
      totalResources,
      totalUsers,
      totalAds,
      downloadStats,
      recentResources,
    ] = await Promise.all([
      Subject.countDocuments(),
      Category.countDocuments(),
      Resource.countDocuments({ isActive: true }),
      User.countDocuments({ role: "student" }),
      Ad.countDocuments({ isActive: true }),
      Resource.aggregate([
        { $group: { _id: null, totalDownloads: { $sum: "$downloadCount" } } },
      ]),
      Resource.find({ isActive: true })
        .populate("subject", "name slug")
        .populate("category", "name slug")
        .sort({ createdAt: -1 })
        .limit(5),
    ]);

    return NextResponse.json({
      stats: {
        totalSubjects,
        totalCategories,
        totalResources,
        totalUsers,
        totalAds,
        totalDownloads: downloadStats[0]?.totalDownloads || 0,
      },
      recentResources,
    });
  } catch (error) {
    console.error('[API Error]:', error);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
