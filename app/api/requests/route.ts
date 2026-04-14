import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import ResourceRequest from "@/models/ResourceRequest";
import { validateInput, resourceRequestSchema } from "@/lib/validations";

// GET — user's own requests
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const requests = await ResourceRequest.find({
      userId: (session.user as { id: string }).id,
    })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ requests: JSON.parse(JSON.stringify(requests)) });
  } catch {
    return NextResponse.json({ error: "Failed to fetch requests" }, { status: 500 });
  }
}

// POST — submit new request
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Sign in to submit a request" }, { status: 401 });
    }

    const body = await req.json();
    const validation = validateInput(resourceRequestSchema, body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const { subject, medium, category, title, year, notes } = validation.data!;

    await dbConnect();

    // Limit: max 5 pending requests per user
    const pendingCount = await ResourceRequest.countDocuments({
      userId: (session.user as { id: string }).id,
      status: "pending",
    });

    if (pendingCount >= 5) {
      return NextResponse.json(
        { error: "You already have 5 pending requests. Please wait for them to be processed." },
        { status: 400 }
      );
    }

    const request = await ResourceRequest.create({
      userId: (session.user as { id: string }).id,
      userName: session.user.name || "Unknown",
      userEmail: session.user.email || "",
      subject,
      medium,
      category,
      title: title.trim(),
      year: year ? Number(year) : undefined,
      notes: notes?.trim() || undefined,
    });

    return NextResponse.json(
      { message: "Request submitted successfully", request: JSON.parse(JSON.stringify(request)) },
      { status: 201 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to submit request";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
