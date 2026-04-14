import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Subject from "@/models/Subject";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    await dbConnect();
    const subject = await Subject.findOne({ slug, isActive: true });
    if (!subject)
      return NextResponse.json({ error: "Subject not found" }, { status: 404 });
    return NextResponse.json({ subject });
  } catch (error: unknown) {
    console.error('[API Error]:', error);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as { role?: string }).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { slug } = await params;
    await dbConnect();
    const body = await req.json();
    const subject = await Subject.findOneAndUpdate({ slug }, body, { new: true });
    if (!subject)
      return NextResponse.json({ error: "Subject not found" }, { status: 404 });
    return NextResponse.json({ subject });
  } catch (error: unknown) {
    console.error('[API Error]:', error);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as { role?: string }).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { slug } = await params;
    await dbConnect();
    await Subject.findOneAndDelete({ slug });
    return NextResponse.json({ message: "Subject deleted" });
  } catch (error: unknown) {
    console.error('[API Error]:', error);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
