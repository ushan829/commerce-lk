import { NextRequest, NextResponse } from "next/server";
import { getServerSession, Session } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import SiteSetting from "@/models/SiteSetting";

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
    { key: "exam_dates", value: JSON.stringify(dates), type: "json", group: "exams", label: "Exam Dates" },
    { upsert: true, new: true }
  );
}

function isAdmin(session: Session | null) {
  return (session?.user as { role?: string })?.role === "admin";
}

// PUT — update an exam date
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!isAdmin(session)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();

    await dbConnect();
    const dates = await getExamDates();
    const idx = dates.findIndex((d) => d.id === id);
    if (idx === -1) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    dates[idx] = {
      ...dates[idx],
      label: body.label?.trim() ?? dates[idx].label,
      date: body.date ?? dates[idx].date,
      subject: body.subject?.trim() || undefined,
      isActive: body.isActive !== undefined ? body.isActive : dates[idx].isActive,
    };

    await saveExamDates(dates);
    return NextResponse.json({ message: "Updated", examDate: dates[idx] });
  } catch {
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

// DELETE — remove an exam date
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!isAdmin(session)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    await dbConnect();
    const dates = await getExamDates();
    const filtered = dates.filter((d) => d.id !== id);
    await saveExamDates(filtered);

    return NextResponse.json({ message: "Deleted" });
  } catch {
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
