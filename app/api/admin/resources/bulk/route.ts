import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Resource from "@/models/Resource";
import Rating from "@/models/Rating";
import redis from "@/lib/redis";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as { role?: string }).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { action, resourceIds } = await req.json();

    if (!resourceIds || !Array.isArray(resourceIds) || resourceIds.length === 0) {
      return NextResponse.json({ error: "Resource IDs are required" }, { status: 400 });
    }

    await dbConnect();

    let result;
    if (action === 'delete') {
      // 1. Delete resources
      const deleteResult = await Resource.deleteMany({ _id: { $in: resourceIds } });
      
      // 2. Cleanup associated ratings
      await Rating.deleteMany({ resourceId: { $in: resourceIds } });

      result = { 
        success: true, 
        deletedCount: deleteResult.deletedCount 
      };
    } else if (action === 'publish') {
      const updateResult = await Resource.updateMany(
        { _id: { $in: resourceIds } },
        { $set: { isActive: true } }
      );

      result = { 
        success: true, 
        updatedCount: updateResult.modifiedCount 
      };
    } else if (action === 'unpublish') {
      const updateResult = await Resource.updateMany(
        { _id: { $in: resourceIds } },
        { $set: { isActive: false } }
      );

      result = { 
        success: true, 
        updatedCount: updateResult.modifiedCount 
      };
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    // Invalidate cache
    const keys = await redis.keys("resources:*");
    if (keys.length > 0) {
      await redis.del(...keys);
    }

    return NextResponse.json(result);

  } catch (error: unknown) {
    console.error('[API Error]:', error);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
