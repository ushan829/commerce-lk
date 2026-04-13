import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Resource from "@/models/Resource";
import { getPresignedViewUrl } from "@/lib/r2";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    await dbConnect();

    const resource = await Resource.findOne({ slug, isActive: true });
    if (!resource) {
      return NextResponse.json({ error: "Resource not found" }, { status: 404 });
    }

    const previewUrl = await getPresignedViewUrl(
      resource.fileKey,
      resource.fileType || "application/pdf",
      3600
    );

    return NextResponse.json({ previewUrl, fileType: resource.fileType });
  } catch {
    return NextResponse.json(
      { error: "Failed to generate preview link" },
      { status: 500 }
    );
  }
}
