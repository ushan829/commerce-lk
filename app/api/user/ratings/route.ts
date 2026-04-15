import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Rating from '@/models/Rating'
import Resource from '@/models/Resource'
import Subject from '@/models/Subject'
import Category from '@/models/Category'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ ratings: [] }, { status: 401 })
    }

    await dbConnect()

    const ratings = await Rating.find({ userId: (session.user as any).id })
      .populate({
        path: 'resourceId',
        select: 'title slug subject medium category',
        populate: [
          { path: 'subject', select: 'name slug' },
          { path: 'category', select: 'name slug' },
        ]
      })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean()

    // Reshape to ensure 'resource' field is available for the frontend
    const formattedRatings = ratings.map((r: any) => ({
      ...r,
      resource: r.resourceId
    }))

    return NextResponse.json({ ratings: JSON.parse(JSON.stringify(formattedRatings)) })
  } catch (error) {
    console.error('[User Ratings GET]:', error)
    return NextResponse.json({ ratings: [] }, { status: 500 })
  }
}
