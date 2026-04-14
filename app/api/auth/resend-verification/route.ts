import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { sendVerificationEmail } from "@/lib/email";
import { rateLimit } from "@/lib/rateLimit";

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    const { success } = rateLimit(`resend:${ip}`, 3, 60 * 1000);
    if (!success) {
      return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
    }

    await dbConnect();
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json({ message: "If an account exists for this email, a verification link has been sent." }, { status: 200 });
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

    return NextResponse.json({ message: "If an account exists for this email, a verification link has been sent." }, { status: 200 });
  } catch (error: unknown) {
    console.error('[API Error]:', error);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
