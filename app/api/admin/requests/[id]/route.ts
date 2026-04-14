import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import ResourceRequest from "@/models/ResourceRequest";
import { sendRequestStatusEmail } from "@/lib/email";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as { role?: string }).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { status, adminNote } = await req.json();

    const allowed = ["pending", "fulfilled", "rejected"];
    if (!allowed.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    await dbConnect();

    // Fetch existing to detect status transition
    const existing = await ResourceRequest.findById(id);
    if (!existing) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }
    const previousStatus = existing.status;

    const updated = await ResourceRequest.findByIdAndUpdate(
      id,
      { $set: { status, adminNote: adminNote?.trim() || undefined } },
      { new: true }
    );

    // Send email only when moving into a terminal state for the first time
    if (previousStatus !== status && (status === "fulfilled" || status === "rejected")) {
      sendRequestStatusEmail({
        to:            updated!.userEmail,
        userName:      updated!.userName,
        resourceTitle: updated!.title,
        status,
        adminNote:     adminNote?.trim() || undefined,
      }).catch(err => console.error("Request status email failed:", err));
    }

    return NextResponse.json({
      message: "Status updated",
      request: JSON.parse(JSON.stringify(updated)),
    });
  } catch (error: unknown) {
    console.error('[API Error]:', error);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
