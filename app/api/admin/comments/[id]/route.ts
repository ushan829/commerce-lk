import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Rating from "@/models/Rating";
import Resource from "@/models/Resource";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as { role?: string }).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { action, flagReason, adminNote } = body;

    await dbConnect();

    let update: any = {};
    if (action === "flag") {
      update = { flagged: true, flagReason: flagReason || "Flagged by Admin" };
    } else if (action === "unflag") {
      update = { flagged: false, flagReason: "" };
    } else if (action === "hide") {
      update = { isHidden: true, adminNote: adminNote || "" };
    } else if (action === "unhide") {
      update = { isHidden: false };
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const rating = await Rating.findByIdAndUpdate(id, { $set: update }, { new: true });

    if (!rating) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, rating });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update comment";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

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
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
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

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to delete comment";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
