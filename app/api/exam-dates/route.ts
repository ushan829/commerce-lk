import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import SiteSetting from "@/models/SiteSetting";

export interface ExamDate {
  id: string;
  label: string;
  date: string; // ISO date string "YYYY-MM-DD"
  subject?: string;
  isActive: boolean;
}

export async function GET() {
  try {
    await dbConnect();
    const setting = await SiteSetting.findOne({ key: "exam_dates" }).lean() as { value: string } | null;

    if (!setting) {
      return NextResponse.json({ examDates: [] });
    }

    const examDates: ExamDate[] = JSON.parse(setting.value);
    const active = examDates.filter((e) => e.isActive && new Date(e.date) >= new Date());

    return NextResponse.json({ examDates: active });
  } catch {
    return NextResponse.json({ examDates: [] });
  }
}
