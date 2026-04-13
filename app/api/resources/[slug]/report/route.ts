import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Resource from "@/models/Resource";
import Report from "@/models/Report";

const REASONS = ["broken-file", "wrong-content", "incorrect-year", "duplicate", "other"];

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const { reason, description, reporterEmail } = await req.json();

    if (!REASONS.includes(reason)) {
      return NextResponse.json({ error: "Invalid reason" }, { status: 400 });
    }

    await dbConnect();
    const resource = await Resource.findOne({ slug, isActive: true })
      .populate("subject", "name")
      .lean() as (Record<string, unknown> & { title?: string; subject?: { name?: string } }) | null;

    if (!resource) {
      return NextResponse.json({ error: "Resource not found" }, { status: 404 });
    }

    await Report.create({
      resourceSlug: slug,
      resourceTitle: resource.title,
      subjectName: resource.subject?.name,
      reason,
      description: description?.trim().slice(0, 1000) || undefined,
      reporterEmail: reporterEmail?.trim().toLowerCase() || undefined,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Report error:", err);
    return NextResponse.json({ error: "Failed to submit report" }, { status: 500 });
  }
}
