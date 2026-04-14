import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { sendVerificationEmail } from "@/lib/email";

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.isVerified) {
      return NextResponse.json({ message: "Already verified" }, { status: 200 });
    }

    // Rate limiting: check if last verification email was sent less than 2 minutes ago
    // We use emailVerificationExpiry - 24 hours as the estimated last sent time
    if (user.emailVerificationExpiry) {
      const lastSentAt = new Date(user.emailVerificationExpiry.getTime() - 24 * 60 * 60 * 1000);
      const now = new Date();
      const diffInMinutes = (now.getTime() - lastSentAt.getTime()) / (1000 * 60);

      if (diffInMinutes < 2) {
        return NextResponse.json(
          { message: "Please wait before requesting another email" },
          { status: 429 }
        );
      }
    }

    const otp = generateOTP();
    const expiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    user.emailVerificationToken = otp;
    user.emailVerificationExpiry = expiry;
    await user.save();

    await sendVerificationEmail(user.email, user.name, otp);

    return NextResponse.json({ message: "Verification email sent" }, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to resend verification";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
