import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Report from "@/models/Report";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as { role?: string }).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { status, adminNote } = await req.json();

    if (!["pending", "reviewed"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    await dbConnect();
    const report = await Report.findByIdAndUpdate(
      id,
      { $set: { status, ...(adminNote !== undefined && { adminNote: adminNote.trim() }) } },
      { new: true }
    );

    if (!report) return NextResponse.json({ error: "Report not found" }, { status: 404 });
    return NextResponse.json({ report: JSON.parse(JSON.stringify(report)) });
  } catch (error) {
    console.error('[API Error]:', error);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
