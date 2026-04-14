import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Ad from "@/models/Ad";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const position = searchParams.get("position");
    const subject = searchParams.get("subject");
    const category = searchParams.get("category");
    const medium = searchParams.get("medium");
    const admin = searchParams.get("admin");

    if (admin === "true") {
      const session = await getServerSession(authOptions);
      if (!session || (session.user as { role?: string }).role !== "admin") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      const ads = await Ad.find().sort({ createdAt: -1 });
      return NextResponse.json({ ads });
    }

    const now = new Date();
    const query: Record<string, unknown> = {
      isActive: true,
      $or: [{ startDate: { $lte: now } }, { startDate: null }],
      $and: [
        { $or: [{ endDate: { $gte: now } }, { endDate: null }] },
      ],
    };

    if (position) query.position = position;

    const ads = await Ad.find(query).sort({ order: 1 });

    const filtered = ads.filter((ad) => {
      if (ad.targetSubjects.length > 0 && subject) {
        if (!ad.targetSubjects.includes(subject)) return false;
      }
      if (ad.targetCategories.length > 0 && category) {
        if (!ad.targetCategories.includes(category)) return false;
      }
      if (ad.targetMediums.length > 0 && medium) {
        if (!ad.targetMediums.includes(medium)) return false;
      }
      return true;
    });

    return NextResponse.json({ ads: filtered });
  } catch (error) {
    console.error('[API Error]:', error);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as { role?: string }).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    await dbConnect();
    const body = await req.json();

    // Whitelist allowed fields
    const { 
      title, type, position, imageUrl, imageKey, linkUrl, altText, 
      htmlContent, htmlCode, nativeTitle, nativeDescription, nativeImage, 
      nativeImageKey, targetSubjects, targetCategories, targetMediums, 
      isActive, startDate, endDate, order 
    } = body;

    const ad = await Ad.create({
      title, type, position, imageUrl, imageKey, linkUrl, altText, 
      htmlContent, htmlCode, nativeTitle, nativeDescription, nativeImage, 
      nativeImageKey, targetSubjects, targetCategories, targetMediums, 
      isActive, startDate, endDate, order
    });

    return NextResponse.json({ ad }, { status: 201 });
  } catch (error: unknown) {
    console.error('[API Error]:', error);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
