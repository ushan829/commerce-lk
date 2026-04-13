import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Ad from "@/models/Ad";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await dbConnect();

    await Ad.findByIdAndUpdate(id, { $inc: { clickCount: 1 } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to track click" }, { status: 500 });
  }
}
