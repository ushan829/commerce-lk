import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Rating from "@/models/Rating";
import User from "@/models/User";
import Resource from "@/models/Resource";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as { role?: string }).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search") || "";
    const filter = searchParams.get("filter") || "all";

    await dbConnect();

    const query: any = {};

    if (filter === "flagged") {
      query.flagged = true;
    } else if (filter === "hidden") {
      query.isHidden = true;
    } else if (filter === "recent") {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      query.createdAt = { $gte: sevenDaysAgo };
    }

    if (search) {
      // Find users matching search
      const users = await User.find({
        $or: [
          { name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
        ],
      }).select("_id");
      const userIds = users.map((u) => u._id);

      // Find resources matching search
      const resources = await Resource.find({
        title: { $regex: search, $options: "i" },
      }).select("_id");
      const resourceIds = resources.map((r) => r._id);

      query.$or = [
        { comment: { $regex: search, $options: "i" } },
        { userId: { $in: userIds } },
        { resourceId: { $in: resourceIds } },
      ];
    }

    const totalCount = await Rating.countDocuments(query);
    const totalPages = Math.ceil(totalCount / limit);
    const skip = (page - 1) * limit;

    const [flaggedCount, hiddenCount] = await Promise.all([
      Rating.countDocuments({ flagged: true }),
      Rating.countDocuments({ isHidden: true }),
    ]);

    const ratings = await Rating.find(query)
      .populate("userId", "name email")
      .populate({
        path: "resourceId",
        select: "title slug subject medium category",
        populate: [
          { path: "subject", select: "name slug" },
          { path: "category", select: "name slug" },
        ],
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    return NextResponse.json({
      ratings: JSON.parse(JSON.stringify(ratings)),
      totalCount,
      totalPages,
      currentPage: page,
      flaggedCount,
      hiddenCount,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch ratings";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as { role?: string }).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { ratingId } = await req.json();
    if (!ratingId) {
      return NextResponse.json({ error: "Rating ID is required" }, { status: 400 });
    }

    await dbConnect();
    const rating = await Rating.findById(ratingId);
    if (!rating) {
      return NextResponse.json({ error: "Rating not found" }, { status: 404 });
    }

    const resourceId = rating.resourceId;
    await Rating.findByIdAndDelete(ratingId);

    // Update resource stats
    const agg = await Rating.aggregate([
      { $match: { resourceId } },
      { $group: { _id: null, avg: { $avg: "$rating" }, count: { $sum: 1 } } },
    ]);

    await Resource.findByIdAndUpdate(resourceId, {
      $set: {
        ratingAvg: agg[0]?.avg ? Math.round(agg[0].avg * 10) / 10 : 0,
        ratingCount: agg[0]?.count || 0,
      },
    });

    return NextResponse.json({ success: true, message: "Rating deleted" });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to delete rating";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
