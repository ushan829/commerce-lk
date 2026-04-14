import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Rating from "@/models/Rating";
import Resource from "@/models/Resource";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as { role?: string }).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await dbConnect();

    const rating = await Rating.findById(id);
    if (!rating) {
      return NextResponse.json({ error: "Rating not found" }, { status: 404 });
    }

    const resourceId = rating.resourceId;
    await Rating.findByIdAndDelete(id);

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
    console.error('[API Error]:', error);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
