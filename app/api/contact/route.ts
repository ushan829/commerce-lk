import { NextRequest, NextResponse } from "next/server";
import { sendContactEmail } from "@/lib/email";
import { rateLimit } from "@/lib/rateLimit";

const ALLOWED_TYPES = [
  "General enquiry",
  "Technical issue",
  "Legal & copyright concern",
  "Partnership / collaboration",
  "Other",
];

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    const { success } = rateLimit(`contact:${ip}`, 3, 60 * 1000);
    if (!success) {
      return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
    }

    const { name, email, type, message } = await req.json();

    if (!name || !email || !type || !message) {
      return NextResponse.json({ error: "All fields are required." }, { status: 400 });
    }

    if (name.trim().length < 2 || name.trim().length > 100) {
      return NextResponse.json({ error: "Name must be between 2 and 100 characters." }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(type)) {
      return NextResponse.json({ error: "Invalid enquiry type." }, { status: 400 });
    }

    if (message.trim().length < 10 || message.trim().length > 2000) {
      return NextResponse.json(
        { error: "Message must be between 10 and 2000 characters." },
        { status: 400 }
      );
    }

    await sendContactEmail({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      type,
      message: message.trim(),
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('[API Error]:', error);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
