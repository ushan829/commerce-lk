import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Resource from "@/models/Resource";
import Subject from "@/models/Subject";
import Category from "@/models/Category";
import User from "@/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createSlug } from "@/lib/utils";
import { sendNewResourceAlert } from "@/lib/email";
import { getPublicFileUrl } from "@/lib/r2";
import redis from "@/lib/redis";
import { validateInput, resourceSchema } from "@/lib/validations";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const subjectSlug = searchParams.get("subject") || "all";
    const medium = searchParams.get("medium") || "all";
    const categorySlug = searchParams.get("category") || "all";
    const featured = searchParams.get("featured") || "false";
    const page = searchParams.get("page") || "1";
    const limit = searchParams.get("limit") || "20";

    // FIX 5: Use specific keys with versioning instead of redis.keys()
    const version = (await redis.get("cache:resources:version")) || "1";
    const cacheKey = `resources:${subjectSlug}:${medium}:${categorySlug}:${featured}:${page}:${limit}:v${version}`;
    
    const cached = await redis.get(cacheKey);
    if (cached) return NextResponse.json(cached);

    await dbConnect();

    const query: Record<string, unknown> = { isActive: true };

    if (subjectSlug !== "all") {
      const subject = await Subject.findOne({ slug: subjectSlug });
      if (subject) query.subject = subject._id;
    }
    if (medium !== "all") query.medium = medium;
    if (categorySlug !== "all") {
      const category = await Category.findOne({ slug: categorySlug });
      if (category) query.category = category._id;
    }
    if (featured === "true") query.isFeatured = true;

    const total = await Resource.countDocuments(query);
    const resources = await Resource.find(query)
      .populate("subject", "name slug color icon")
      .populate("category", "name slug icon")
      .sort({ createdAt: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit))
      .lean();

    const cleanedResources = (resources as any[]).map(r => ({
      ...r,
      fileUrl: r.fileUrl ? getPublicFileUrl(r.fileUrl) : r.fileUrl,
      thumbnail: r.thumbnail ? getPublicFileUrl(r.thumbnail) : r.thumbnail,
      ogImage: r.ogImage ? getPublicFileUrl(r.ogImage) : r.ogImage,
    }));

    const result = {
      resources: cleanedResources,
      pagination: { 
        total, 
        page: parseInt(page), 
        limit: parseInt(limit), 
        pages: Math.ceil(total / parseInt(limit)) 
      },
    };

    await redis.set(cacheKey, result, { ex: 3600 }); // cache 1 hour with versioning
    return NextResponse.json(result);
  } catch (error) {
    console.error('[API GET Error]:', error);
    return NextResponse.json({ error: "Failed to fetch resources" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    await dbConnect();
    const body = await req.json();

    // FIX 6: Add Zod Validation
    const validation = validateInput(resourceSchema, body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const { 
      title, slug, description, subject, medium, category, 
      fileUrl, fileKey, fileSize, fileType, thumbnailUrl, thumbnailKey,
      tags, isActive, isFeatured, year, term, seoTitle, seoDescription 
    } = validation.data!;

    const finalSlug = slug || createSlug(title);
    
    const resource = await Resource.create({
      title,
      slug: finalSlug,
      description,
      subject,
      medium,
      category,
      fileUrl,
      fileKey,
      fileSize,
      fileType,
      thumbnailUrl,
      thumbnailKey,
      tags,
      isActive,
      isFeatured,
      year,
      term,
      seoTitle,
      seoDescription,
      uploadedBy: session.user.id,
    });

    // FIX 5: Invalidate cache using versioning instead of scanning keys
    await redis.incr("cache:resources:version");

    // Fire-and-forget: notify subscribed users
    if (resource.isActive) {
      notifySubscribers(resource).catch(err =>
        console.error("New resource alert error:", err)
      );
    }

    return NextResponse.json({ resource }, { status: 201 });
  } catch (error: unknown) {
    console.error('[API POST Error]:', error);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}

// ── Notify users who subscribed to this subject ──────────────────────────────
async function notifySubscribers(resource: {
  _id: unknown;
  title: string;
  slug: string;
  subject: unknown;
  medium: string;
}) {
  const populated = await Resource.findById(resource._id)
    .populate("subject",  "name slug")
    .populate("category", "name slug")
    .lean() as (Record<string, unknown> & {
      subject:  { name: string; slug: string };
      category: { name: string; slug: string };
    }) | null;

  if (!populated) return;

  const subjectSlug = populated.subject.slug;
  const baseUrl = process.env.NEXTAUTH_URL || "https://commerce.lk";
  const resourceUrl = `${baseUrl}/${subjectSlug}/${resource.medium}/${populated.category.slug}/${(populated as any).slug}`;

  // Find all active, verified users who want new-resource emails
  // and whose subscription list includes this subject (or is empty = "all")
  const users = await User.find({
    isActive: true,
    isVerified: true,
    "notifications.newResources": true,
    $or: [
      { subscribedSubjects: { $size: 0 } },
      { subscribedSubjects: subjectSlug },
    ],
  }).select("name email").lean() as unknown as { name: string; email: string }[];

  // Send in batches of 20 to avoid overwhelming the SMTP server
  const BATCH = 20;
  for (let i = 0; i < users.length; i += BATCH) {
    const batch = users.slice(i, i + BATCH);
    await Promise.allSettled(
      batch.map(u =>
        sendNewResourceAlert({
          to:            u.email,
          userName:      u.name,
          resourceTitle: String(populated.title),
          subjectName:   populated.subject.name,
          categoryName:  populated.category.name,
          medium:        resource.medium,
          resourceUrl,
        })
      )
    );
  }
}
