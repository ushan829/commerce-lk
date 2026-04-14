import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Rating from "@/models/Rating";
import Resource from "@/models/Resource";

// GET — fetch average rating + count + current user's rating
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const session = await getServerSession(authOptions);
    const breakdown = new URL(req.url).searchParams.get("breakdown") === "1";
    await dbConnect();

    const resource = await Resource.findOne({ slug, isActive: true }).select("_id").lean() as { _id: { toString(): string } } | null;
    if (!resource) {
      return NextResponse.json({ error: "Resource not found" }, { status: 404 });
    }

    const resourceId = resource._id.toString();

    const userId = session?.user ? (session.user as { id: string }).id : null;

    const [agg, userRating, breakdownAgg, reviews] = await Promise.all([
      Rating.aggregate([
        { $match: { resourceId } },
        { $group: { _id: null, avg: { $avg: "$rating" }, count: { $sum: 1 } } },
      ]),
      userId
        ? Rating.findOne({ resourceId, userId }).lean()
        : null,
      Rating.aggregate([
        { $match: { resourceId } },
        { $group: { _id: "$rating", count: { $sum: 1 } } },
      ]),
      Rating.find({ resourceId, comment: { $exists: true, $ne: "" } })
        .populate("userId", "name")
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),
    ]);

    const bd: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    for (const b of breakdownAgg) bd[b._id] = b.count;

    const result: Record<string, unknown> = {
      avg: agg[0]?.avg ? Math.round(agg[0].avg * 10) / 10 : 0,
      count: agg[0]?.count || 0,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      userRating: userRating ? { rating: (userRating as any).rating, comment: (userRating as any).comment } : null,
      breakdown: bd,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      reviews: reviews.map((r: any) => ({
        rating: r.rating,
        comment: r.comment,
        createdAt: r.createdAt,
        userId: r.userId?._id?.toString() || r.userId?.toString(),
        userName: r.userId?.name || "Anonymous",
      })),
    };

    if (breakdown) {
      // breakdown param kept for backward compat but now always included
    }

    return NextResponse.json(result);
  } catch (error: unknown) {
    return NextResponse.json({ error: "Failed to fetch ratings" }, { status: 500 });
  }
}

// POST — submit or update rating (auth required)
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Sign in to rate resources" }, { status: 401 });
    }

    const { slug } = await params;
    const { rating, comment } = await req.json();

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 });
    }

    await dbConnect();
    const resource = await Resource.findOne({ slug, isActive: true }).select("_id").lean() as { _id: { toString(): string } } | null;
    if (!resource) {
      return NextResponse.json({ error: "Resource not found" }, { status: 404 });
    }

    const resourceId = resource._id.toString();
    const userId = (session.user as { id: string }).id;

    // Upsert the rating
    await Rating.findOneAndUpdate(
      { userId, resourceId },
      { rating, comment: comment?.trim() || undefined },
      { upsert: true, new: true }
    );

    // Recalculate avg & count and persist to Resource for fast reads
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

    return NextResponse.json({
      message: "Rating saved",
      avg: agg[0]?.avg ? Math.round(agg[0].avg * 10) / 10 : 0,
      count: agg[0]?.count || 0,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to save rating";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
