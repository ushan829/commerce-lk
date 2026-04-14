import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Resource from "@/models/Resource";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const user = await User.findById((session.user as { id: string }).id)
      .select("downloadHistory")
      .lean() as { downloadHistory: { resourceId: string; downloadedAt: Date }[] } | null;

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const history = user.downloadHistory || [];
    const resourceIds = history.map((h) => h.resourceId);
    const resources = await Resource.find({ _id: { $in: resourceIds } })
      .select("title slug subject medium category fileType fileSize thumbnail")
      .populate("subject", "name slug")
      .populate("category", "name slug")
      .lean();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const resourceMap = new Map(resources.map((r: any) => [r._id.toString(), r]));

    const result = history
      .sort((a, b) => new Date(b.downloadedAt).getTime() - new Date(a.downloadedAt).getTime())
      .map((h) => ({
        resource: resourceMap.get(h.resourceId) || null,
        downloadedAt: h.downloadedAt,
      }))
      .filter((h) => h.resource !== null);

    return NextResponse.json({ downloads: JSON.parse(JSON.stringify(result)) });
  } catch (error: unknown) {
    console.error('[API Error]:', error);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const { resourceSlug } = await req.json();
    if (!resourceSlug) {
      return NextResponse.json({ error: "resourceSlug is required" }, { status: 400 });
    }

    const resource = await Resource.findOne({ slug: resourceSlug }).select("_id").lean() as { _id: { toString(): string } } | null;
    if (!resource) {
      return NextResponse.json({ error: "Resource not found" }, { status: 404 });
    }

    const resourceId = resource._id.toString();

    // Add to history (keep last 200, avoid duplicates by pushing a fresh entry)
    await User.findByIdAndUpdate(
      (session.user as { id: string }).id,
      {
        $push: {
          downloadHistory: {
            $each: [{ resourceId, downloadedAt: new Date() }],
            $slice: -200,
          },
        },
      }
    );

    return NextResponse.json({ message: "Download recorded" });
  } catch (error: unknown) {
    console.error('[API Error]:', error);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
