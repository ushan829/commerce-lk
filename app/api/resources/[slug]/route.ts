import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Resource from "@/models/Resource";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { deleteFromR2 } from "@/lib/r2";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    await dbConnect();
    const resource = await Resource.findOne({ slug, isActive: true })
      .populate("subject", "name slug color icon")
      .populate("category", "name slug icon");

    if (!resource)
      return NextResponse.json({ error: "Resource not found" }, { status: 404 });

    await Resource.findByIdAndUpdate(resource._id, { $inc: { viewCount: 1 } });
    return NextResponse.json({ resource });
  } catch {
    return NextResponse.json({ error: "Failed to fetch resource" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as { role?: string }).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { slug } = await params;
    await dbConnect();
    const body = await req.json();
    const resource = await Resource.findOneAndUpdate({ slug }, body, { new: true });
    if (!resource)
      return NextResponse.json({ error: "Resource not found" }, { status: 404 });
    return NextResponse.json({ resource });
  } catch {
    return NextResponse.json({ error: "Failed to update resource" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as { role?: string }).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { slug } = await params;
    await dbConnect();
    const resource = await Resource.findOne({ slug });
    if (resource) {
      await deleteFromR2(resource.fileKey);
      if (resource.thumbnail) await deleteFromR2(resource.thumbnail);
      if (resource.ogImage) await deleteFromR2(resource.ogImage);
      await Resource.findByIdAndDelete(resource._id);
    }
    return NextResponse.json({ message: "Resource deleted" });
  } catch {
    return NextResponse.json({ error: "Failed to delete resource" }, { status: 500 });
  }
}
