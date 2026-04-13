import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Resource from "@/models/Resource";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as { role?: string }).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    await dbConnect();
    const { slug } = await params;

    const original = await Resource.findOne({ slug }).lean();
    if (!original) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Find a unique slug
    const base = `${slug}-copy`;
    let newSlug = base;
    let n = 2;
    while (await Resource.exists({ slug: newSlug })) newSlug = `${base}-${n++}`;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { _id, createdAt, updatedAt, ...rest } = original as any;
    void _id; void createdAt; void updatedAt;

    const dup = await Resource.create({
      ...rest,
      slug: newSlug,
      title: `${rest.title} (Copy)`,
      isActive: false,
      isFeatured: false,
      downloadCount: 0,
      viewCount: 0,
      ratingAvg: 0,
      ratingCount: 0,
    });

    return NextResponse.json({ slug: dup.slug }, { status: 201 });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to duplicate" },
      { status: 500 }
    );
  }
}
