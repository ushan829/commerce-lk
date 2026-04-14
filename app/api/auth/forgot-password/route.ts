import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { sendPasswordResetEmail } from "@/lib/email";
import { forgotPasswordRateLimit, checkRateLimit } from "@/lib/rateLimit";
import { validateInput, forgotPasswordSchema } from "@/lib/validations";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
    const { success } = await checkRateLimit(forgotPasswordRateLimit, ip);
    if (!success) {
      return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
    }

    await dbConnect();
    const body = await req.json();
    const validation = validateInput(forgotPasswordSchema, body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const { email } = validation.data!;

    const user = await User.findOne({ email });

    // Always return success to prevent email enumeration
    if (!user) {
      return NextResponse.json({ message: "If an account exists for this email, a reset link has been sent." }, { status: 200 });
    }

    const token = crypto.randomBytes(32).toString("hex");
    user.passwordResetToken = token;
    user.passwordResetExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    await sendPasswordResetEmail(email, user.name, token);

    return NextResponse.json({ message: "If an account exists for this email, a reset link has been sent." }, { status: 200 });
  } catch (error: unknown) {
    console.error('[API Error]:', error);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
