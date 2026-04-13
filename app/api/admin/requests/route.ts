import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import ResourceRequest from "@/models/ResourceRequest";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as { role?: string }).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "";

    await dbConnect();
    const filter = status ? { status } : {};
    const requests = await ResourceRequest.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ requests: JSON.parse(JSON.stringify(requests)) });
  } catch {
    return NextResponse.json({ error: "Failed to fetch requests" }, { status: 500 });
  }
}
