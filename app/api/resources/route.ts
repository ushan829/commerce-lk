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

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);

    const subjectSlug = searchParams.get("subject");
    const medium = searchParams.get("medium");
    const categorySlug = searchParams.get("category");
    const featured = searchParams.get("featured");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const query: Record<string, unknown> = { isActive: true };

    if (subjectSlug) {
      const subject = await Subject.findOne({ slug: subjectSlug });
      if (subject) query.subject = subject._id;
    }
    if (medium) query.medium = medium;
    if (categorySlug) {
      const category = await Category.findOne({ slug: categorySlug });
      if (category) query.category = category._id;
    }
    if (featured === "true") query.isFeatured = true;

    const total = await Resource.countDocuments(query);
    const resources = await Resource.find(query)
      .populate("subject", "name slug color icon")
      .populate("category", "name slug icon")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const cleanedResources = (resources as any[]).map(r => ({
      ...r,
      fileUrl: r.fileUrl ? getPublicFileUrl(r.fileUrl) : r.fileUrl,
      thumbnail: r.thumbnail ? getPublicFileUrl(r.thumbnail) : r.thumbnail,
      ogImage: r.ogImage ? getPublicFileUrl(r.ogImage) : r.ogImage,
    }));

    return NextResponse.json({
      resources: cleanedResources,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch resources" }, { status: 500 });
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
    const slug = body.slug || createSlug(body.title);
    const resource = await Resource.create({
      ...body,
      slug,
      uploadedBy: (session.user as { id?: string }).id,
    });

    // Fire-and-forget: notify subscribed users
    if (resource.isActive) {
      notifySubscribers(resource).catch(err =>
        console.error("New resource alert error:", err)
      );
    }

    return NextResponse.json({ resource }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create resource";
    return NextResponse.json({ error: message }, { status: 500 });
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
