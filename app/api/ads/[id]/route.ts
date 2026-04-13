import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Ad from "@/models/Ad";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { deleteFromR2 } from "@/lib/r2";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as { role?: string }).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await params;
    await dbConnect();
    const body = await req.json();

    // If the image was replaced, delete the old R2 object
    const existing = await Ad.findById(id);
    if (existing) {
      if (existing.imageKey && body.imageKey && existing.imageKey !== body.imageKey) {
        await deleteFromR2(existing.imageKey).catch(() => {});
      }
      if (existing.nativeImageKey && body.nativeImageKey && existing.nativeImageKey !== body.nativeImageKey) {
        await deleteFromR2(existing.nativeImageKey).catch(() => {});
      }
    }

    const ad = await Ad.findByIdAndUpdate(id, body, { new: true });
    if (!ad) return NextResponse.json({ error: "Ad not found" }, { status: 404 });
    return NextResponse.json({ ad });
  } catch {
    return NextResponse.json({ error: "Failed to update ad" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as { role?: string }).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await params;
    await dbConnect();

    const ad = await Ad.findById(id);
    if (ad) {
      // Delete uploaded images from R2
      const keysToDelete = [ad.imageKey, ad.nativeImageKey].filter(Boolean) as string[];
      await Promise.all(keysToDelete.map((k) => deleteFromR2(k).catch(() => {})));
      await ad.deleteOne();
    }

    return NextResponse.json({ message: "Ad deleted" });
  } catch {
    return NextResponse.json({ error: "Failed to delete ad" }, { status: 500 });
  }
}
