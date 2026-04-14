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
  } catch (error) {
    console.error('[API Error]:', error);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
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

    const { name, slug, description, icon, isActive, order, color } = body;

    const finalSlug = slug || createSlug(name);
    const subject = await Subject.create({ 
      name, 
      slug: finalSlug, 
      description, 
      icon, 
      isActive, 
      order, 
      color 
    });

    return NextResponse.json({ subject }, { status: 201 });
  } catch (error: unknown) {
    console.error('[API Error]:', error);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
