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

    // Whitelist allowed fields
    const { 
      title, type, position, imageUrl, imageKey, linkUrl, altText, 
      htmlContent, htmlCode, nativeTitle, nativeDescription, nativeImage, 
      nativeImageKey, targetSubjects, targetCategories, targetMediums, 
      isActive, startDate, endDate, order 
    } = body;

    const updates = { 
      title, type, position, imageUrl, imageKey, linkUrl, altText, 
      htmlContent, htmlCode, nativeTitle, nativeDescription, nativeImage, 
      nativeImageKey, targetSubjects, targetCategories, targetMediums, 
      isActive, startDate, endDate, order 
    };

    // If the image was replaced, delete the old R2 object
    const existing = await Ad.findById(id);
    if (existing) {
      if (existing.imageKey && updates.imageKey && existing.imageKey !== updates.imageKey) {
        await deleteFromR2(existing.imageKey).catch(() => {});
      }
      if (existing.nativeImageKey && updates.nativeImageKey && existing.nativeImageKey !== updates.nativeImageKey) {
        await deleteFromR2(existing.nativeImageKey).catch(() => {});
      }
    }

    const ad = await Ad.findByIdAndUpdate(id, { $set: updates }, { new: true });
    if (!ad) return NextResponse.json({ error: "Ad not found" }, { status: 404 });
    return NextResponse.json({ ad });
  } catch (error) {
    console.error('[API Error]:', error);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
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
  } catch (error) {
    console.error('[API Error]:', error);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
