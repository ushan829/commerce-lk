import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Resource from "@/models/Resource";

// Returns the public CDN URL for a resource file.
// Preview component now uses this URL directly via the custom domain.
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    await dbConnect();

    const resource = await Resource.findOne({ slug, isActive: true })
      .select("fileKey fileType")
      .lean() as { fileKey: string; fileType: string } | null;

    if (!resource) {
      return NextResponse.json({ error: "Resource not found" }, { status: 404 });
    }

    const publicUrl = `https://files.commerce.lk/${resource.fileKey}`;
    return NextResponse.json({ publicUrl, contentType: resource.fileType || "application/pdf" });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to get preview URL";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
