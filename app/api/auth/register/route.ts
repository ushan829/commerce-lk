import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { sendWelcomeEmail, sendVerificationEmail } from "@/lib/email";
import { rateLimit } from "@/lib/rateLimit";

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    const { success } = rateLimit(`register:${ip}`, 5, 60 * 1000);
    if (!success) {
      return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
    }

    await dbConnect();
    const {
      name, email, password,
      phone, school, district, stream, medium, alYear, gender, dateOfBirth,
    } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 400 }
      );
    }

    const otp = generateOTP();
    const expiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const user = await User.create({
      name, email, password, role: "student",
      phone: phone || undefined,
      school: school || undefined,
      district: district || undefined,
      stream: stream || undefined,
      medium: medium || undefined,
      alYear: alYear ? Number(alYear) : undefined,
      gender: gender || undefined,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
      emailVerificationToken: otp,
      emailVerificationExpiry: expiry,
    });

    // Send emails
    try {
      await sendWelcomeEmail(email, name);
      await sendVerificationEmail(email, name, otp);
    } catch (emailError) {
      console.error("Failed to send verification email:", emailError);
      // We don't delete the user because they can resend the OTP, but we notify the UI
      return NextResponse.json(
        {
          message: "Account created but failed to send verification email. Please use the resend option.",
          user: { id: user._id, name: user.name, email: user.email },
        },
        { status: 201 }
      );
    }

    return NextResponse.json(
      {
        message: "Account created successfully",
        user: { id: user._id, name: user.name, email: user.email },
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error('[API Error]:', error);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
