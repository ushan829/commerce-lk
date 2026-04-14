import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Broadcast from "@/models/Broadcast";
import User from "@/models/User";
import { sendBroadcastEmail } from "@/lib/email";
import { rateLimit } from "@/lib/rateLimit";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as { role?: string }).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const broadcasts = await Broadcast.find()
      .populate("sentBy", "name")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ broadcasts: JSON.parse(JSON.stringify(broadcasts)) });
  } catch (error: unknown) {
    console.error('[API Error]:', error);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as { role?: string }).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { success } = rateLimit(`broadcast:${(session.user as { id: string }).id}`, 2, 60 * 60 * 1000);
    if (!success) {
      return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
    }

    const { subject, message, recipientType } = await req.json();

    if (!subject || !message || !recipientType) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await dbConnect();

    // 1. Fetch users
    const query: any = { isActive: true };
    if (recipientType === 'verified') {
      query.isVerified = true;
    } else if (recipientType === 'unverified') {
      query.isVerified = false;
    }

    const users = await User.find(query).select("email").lean();
    if (users.length === 0) {
      return NextResponse.json({ error: "No recipients found" }, { status: 404 });
    }

    // 2. Save broadcast record
    const broadcast = await Broadcast.create({
      subject,
      message,
      recipientType,
      totalRecipients: users.length,
      status: 'sending',
      sentBy: (session.user as { id: string }).id
    });

    // 3. Send emails in batches (Async process, but for small scale we can wait or use a background job)
    // For this implementation, we'll process it and return when done or partially done.
    // In a real production app, this should be a background task (bullmq, etc.)
    
    let sentCount = 0;
    let failedCount = 0;

    for (let i = 0; i < users.length; i += 10) {
      const batch = users.slice(i, i + 10);
      const results = await Promise.allSettled(
        batch.map((user) => 
          sendBroadcastEmail({
            to: user.email,
            subject,
            message
          })
        )
      );

      results.forEach((res) => {
        if (res.status === 'fulfilled') sentCount++;
        else failedCount++;
      });

      // Update progress in DB every batch
      await Broadcast.findByIdAndUpdate(broadcast._id, {
        $set: { sentCount, failedCount }
      });

      // Small delay between batches
      if (i + 10 < users.length) await delay(1000);
    }

    // 4. Update final status
    const finalBroadcast = await Broadcast.findByIdAndUpdate(broadcast._id, {
      $set: { 
        status: failedCount === users.length ? 'failed' : 'completed',
        completedAt: new Date()
      }
    }, { new: true });

    return NextResponse.json({ 
      success: true, 
      sentCount, 
      failedCount, 
      broadcast: JSON.parse(JSON.stringify(finalBroadcast)) 
    });

  } catch (error: unknown) {
    console.error('[API Error]:', error);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
