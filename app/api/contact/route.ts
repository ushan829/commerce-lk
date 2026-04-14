import { NextRequest, NextResponse } from "next/server";
import { sendContactEmail } from "@/lib/email";
import { contactRateLimit, checkRateLimit } from "@/lib/rateLimit";
import { validateInput, contactSchema } from "@/lib/validations";

const ALLOWED_TYPES = [
  "General enquiry",
  "Technical issue",
  "Legal & copyright concern",
  "Partnership / collaboration",
  "Other",
];

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
    const { success } = await checkRateLimit(contactRateLimit, ip);
    if (!success) {
      return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
    }

    const body = await req.json();
    const validation = validateInput(contactSchema, body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const { name, email, type, message } = validation.data!;

    if (!ALLOWED_TYPES.includes(type)) {
      return NextResponse.json({ error: "Invalid enquiry type." }, { status: 400 });
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
