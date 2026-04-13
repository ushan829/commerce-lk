import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Resource from "@/models/Resource";
import { getPresignedDownloadUrl } from "@/lib/r2";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    await dbConnect();
    const resource = await Resource.findOne({ slug, isActive: true });

    if (!resource)
      return NextResponse.json({ error: "Resource not found" }, { status: 404 });

    const downloadUrl = await getPresignedDownloadUrl(
      resource.fileKey,
      `${resource.title}.${resource.fileKey.split(".").pop()}`,
      3600
    );

    await Resource.findByIdAndUpdate(resource._id, {
      $inc: { downloadCount: 1 },
    });

    return NextResponse.json({ downloadUrl });
  } catch {
    return NextResponse.json(
      { error: "Failed to generate download link" },
      { status: 500 }
    );
  }
}
