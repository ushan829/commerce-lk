import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Resource from "@/models/Resource";
import { getPublicFileUrl } from "@/lib/r2";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as { role?: string }).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const resources = await Resource.find();
    let updatedCount = 0;
    const results = [];

    for (const resource of resources) {
      let needsUpdate = false;
      const updates: any = {};

      if (resource.fileUrl) {
        const newUrl = getPublicFileUrl(resource.fileUrl);
        if (newUrl !== resource.fileUrl) {
          updates.fileUrl = newUrl;
          needsUpdate = true;
        }
      }

      if (resource.thumbnail) {
        const newUrl = getPublicFileUrl(resource.thumbnail);
        if (newUrl !== resource.thumbnail) {
          updates.thumbnail = newUrl;
          needsUpdate = true;
        }
      }

      if (resource.ogImage) {
        const newUrl = getPublicFileUrl(resource.ogImage);
        if (newUrl !== resource.ogImage) {
          updates.ogImage = newUrl;
          needsUpdate = true;
        }
      }

      if (needsUpdate) {
        await Resource.findByIdAndUpdate(resource._id, { $set: updates });
        updatedCount++;
        results.push({
          id: resource._id,
          title: resource.title,
          updatedFields: Object.keys(updates)
        });
      }
    }

    return NextResponse.json({
      success: true,
      updatedCount,
      results
    });
  } catch (error: unknown) {
    console.error('[API Error]:', error);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
