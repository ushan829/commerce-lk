import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Subject from "@/models/Subject";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createSlug } from "@/lib/utils";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const all = searchParams.get("all");

    const query = all === "true" ? {} : { isActive: true };
    const subjects = await Subject.find(query).sort({ order: 1 });
    return NextResponse.json({ subjects });
  } catch {
    return NextResponse.json({ error: "Failed to fetch subjects" }, { status: 500 });
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

    const slug = body.slug || createSlug(body.name);
    const subject = await Subject.create({ ...body, slug });

    return NextResponse.json({ subject }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create subject";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
