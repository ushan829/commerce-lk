import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { sendVerificationEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const user = await User.findOne({ email });

    if (!user) {
      // Don't reveal whether the email exists
      return NextResponse.json({ message: "If this email is registered, a verification code has been sent." });
    }

    if (user.isVerified) {
      return NextResponse.json({ error: "Email is already verified" }, { status: 400 });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.emailVerificationToken = otp;
    user.emailVerificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await user.save();

    await sendVerificationEmail(email, user.name, otp);

    return NextResponse.json({ message: "Verification code sent" });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to resend";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
