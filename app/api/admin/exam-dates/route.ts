import { NextRequest, NextResponse } from "next/server";
import { getServerSession, Session } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import SiteSetting from "@/models/SiteSetting";
import { randomUUID } from "crypto";

interface ExamDate {
  id: string;
  label: string;
  date: string;
  subject?: string;
  isActive: boolean;
}

async function getExamDates(): Promise<ExamDate[]> {
  const setting = await SiteSetting.findOne({ key: "exam_dates" }).lean() as { value: string } | null;
  if (!setting) return [];
  try {
    return JSON.parse(setting.value);
  } catch {
    return [];
  }
}

async function saveExamDates(dates: ExamDate[]) {
  await SiteSetting.findOneAndUpdate(
    { key: "exam_dates" },
    {
      key: "exam_dates",
      value: JSON.stringify(dates),
      type: "json",
      group: "exams",
      label: "Exam Dates",
    },
    { upsert: true, new: true }
  );
}

function isAdmin(session: Session | null) {
  return (session?.user as { role?: string })?.role === "admin";
}

// GET — list all exam dates (admin sees all, incl. inactive)
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!isAdmin(session)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    await dbConnect();
    const dates = await getExamDates();
    return NextResponse.json({ examDates: dates });
  } catch (error) {
    console.error('[API Error]:', error);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}

// POST — add a new exam date
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!isAdmin(session)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { label, date, subject, isActive } = await req.json();
    if (!label?.trim() || !date) {
      return NextResponse.json({ error: "label and date are required" }, { status: 400 });
    }

    await dbConnect();
    const dates = await getExamDates();
    const newEntry: ExamDate = {
      id: randomUUID(),
      label: label.trim(),
      date,
      subject: subject?.trim() || undefined,
      isActive: isActive !== false,
    };
    dates.push(newEntry);
    await saveExamDates(dates);

    return NextResponse.json({ message: "Exam date added", examDate: newEntry });
  } catch {
    return NextResponse.json({ error: "Failed to add" }, { status: 500 });
  }
}
}
