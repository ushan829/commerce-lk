import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Resource from "@/models/Resource";
import Rating from "@/models/Rating";

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

    if (action === 'delete') {
      // 1. Delete resources
      const deleteResult = await Resource.deleteMany({ _id: { $in: resourceIds } });
      
      // 2. Cleanup associated ratings
      await Rating.deleteMany({ resourceId: { $in: resourceIds } });

      return NextResponse.json({ 
        success: true, 
        deletedCount: deleteResult.deletedCount 
      });
    }

    if (action === 'publish') {
      const updateResult = await Resource.updateMany(
        { _id: { $in: resourceIds } },
        { $set: { isActive: true } }
      );

      return NextResponse.json({ 
        success: true, 
        updatedCount: updateResult.modifiedCount 
      });
    }

    if (action === 'unpublish') {
      const updateResult = await Resource.updateMany(
        { _id: { $in: resourceIds } },
        { $set: { isActive: false } }
      );

      return NextResponse.json({ 
        success: true, 
        updatedCount: updateResult.modifiedCount 
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });

  } catch (error: unknown) {
    console.error('[API Error]:', error);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
