import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Ad from "@/models/Ad";

export async function GET(request: NextRequest) {
  try {
    await dbConnect()
    const { searchParams } = new URL(request.url)
    const position = searchParams.get("position")?.trim()
    
    if (!position) {
      return NextResponse.json({ ad: null })
    }

    // Log all ads to see what positions exist
    const allAds = await Ad.find({})
    console.log("All ads in DB:", JSON.stringify(allAds.map(a => ({
      title: a.title,
      position: a.position,
      isActive: a.isActive,
      active: (a as any).active
    }))))

    const now = new Date()
    const ad = await Ad.findOne({
      position: position,
      $and: [
        {
          $or: [
            { isActive: true },
            { active: true }
          ]
        },
        {
          $or: [
            { startDate: { $exists: false } },
            { startDate: null },
            { startDate: { $lte: now } }
          ]
        },
        {
          $or: [
            { endDate: { $exists: false } },
            { endDate: null },
            { endDate: { $gte: now } }
          ]
        }
      ]
    }).sort({ order: 1 })

    console.log(`Found ad for ${position}:`, ad ? ad.title : "null")
    return NextResponse.json({ ad })
  } catch (error) {
    console.error("Ad display API error:", error)
    return NextResponse.json({ ad: null })
  }
}
