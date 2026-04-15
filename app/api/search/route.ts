import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Resource from "@/models/Resource";
import Subject from "@/models/Subject";
import Category from "@/models/Category";

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);

    const q            = searchParams.get("q")?.trim() || "";
    const subjectSlug  = searchParams.get("subject") || "";
    const medium       = searchParams.get("medium") || "";
    const categorySlug = searchParams.get("category") || "";
    const yearParam    = searchParams.get("year") || "";
    const page         = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit        = 20;

    if (!q && !subjectSlug && !medium && !categorySlug && !yearParam) {
      return NextResponse.json({ results: [], total: 0, page, pages: 0 });
    }

    const query: Record<string, unknown> = { isActive: true };

    // Full-text search on title/description/tags, fall back to regex for short terms
    if (q) {
      if (q.length >= 3) {
        query.$text = { $search: q };
      } else {
        query.title = { $regex: escapeRegex(q), $options: "i" };
      }
    }

    if (subjectSlug) {
      const subject = await Subject.findOne({ slug: subjectSlug, isActive: true }).lean();
      if (subject) query.subject = (subject as { _id: unknown })._id;
      else return NextResponse.json({ results: [], total: 0, page, pages: 0 });
    }

    if (medium && ["sinhala", "tamil", "english"].includes(medium)) {
      query.medium = medium;
    }

    if (categorySlug) {
      const category = await Category.findOne({ slug: categorySlug, isActive: true }).lean();
      if (category) query.category = (category as { _id: unknown })._id;
      else return NextResponse.json({ results: [], total: 0, page, pages: 0 });
    }

    if (yearParam) {
      const y = parseInt(yearParam);
      if (!isNaN(y)) query.year = y;
    }

    const total = await Resource.countDocuments(query);
    const pages = Math.ceil(total / limit);

    // When using $text, sort by relevance score; otherwise sort by downloads
    const sortStage = q && q.length >= 3
      ? { score: { $meta: "textScore" }, downloadCount: -1 }
      : { downloadCount: -1 as const };

    const selectStage = q && q.length >= 3
      ? { score: { $meta: "textScore" } }
      : {};

    const results = await Resource.find(query, selectStage)
      .populate("subject", "name slug color icon")
      .populate("category", "name slug")
      .sort(sortStage as any)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return NextResponse.json({
      results,
      total,
      page,
      pages,
    });
  } catch (error: unknown) {
    console.error('[API Error]:', error);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
