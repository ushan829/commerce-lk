"use client";

import { useState, useEffect } from "react";

interface ExamDate { id: string; label: string; date: string; isActive: boolean; }
interface TimeLeft  { days: number; hours: number; minutes: number; seconds: number; total: number; }

function calcTimeLeft(dateStr: string): TimeLeft {
  const diff = new Date(dateStr).getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };
  return {
    total: diff,
    days:    Math.floor(diff / 86400000),
    hours:   Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
  };
}

function Timer({ date }: { date: string }) {
  const [t, setT] = useState<TimeLeft>(() => calcTimeLeft(date));
  useEffect(() => {
    const id = setInterval(() => setT(calcTimeLeft(date)), 1000);
    return () => clearInterval(id);
  }, [date]);

  if (t.total <= 0) return <span className="text-xl font-bold text-gray-400">Exam Passed</span>;

  return (
    <div className="flex items-center gap-4 sm:gap-6">
      {[
        { l: "Days",    v: t.days },
        { l: "Hours",   v: t.hours },
        { l: "Minutes", v: t.minutes },
        { l: "Seconds", v: t.seconds },
      ].map(({ l, v }) => (
        <div key={l} className="flex flex-col items-center">
          <div className="bg-white rounded-xl px-3 py-2 min-w-[60px] text-center shadow-sm">
            <span className="text-2xl font-bold text-blue-600 tabular-nums">
              {String(v).padStart(2, "0")}
            </span>
          </div>
          <span className="text-xs text-blue-400 mt-0.5 font-bold uppercase tracking-wider">{l}</span>
        </div>
      ))}
    </div>
  );
}

export default function ExamCountdown({ compact = false }: { compact?: boolean }) {
  const [examDates, setExamDates] = useState<ExamDate[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/exam-dates")
      .then(r => r.json())
      .then(d => {
        if (d.examDates?.length) {
          setExamDates([...d.examDates].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
        }
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, []);

  if (!loaded || examDates.length === 0) return null;

  const current = examDates[0];

  const content = (
    <div className={`relative overflow-hidden bg-gradient-to-r from-blue-600 to-blue-500 shadow-xl shadow-blue-500/20 ${compact ? "p-6 rounded-2xl" : "rounded-3xl p-8 sm:p-12"}`}>
      {/* Decorative circles */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-64 h-64 bg-blue-400/20 rounded-full blur-2xl" />

      <div className={`relative flex flex-col justify-between gap-8 ${compact ? "" : "lg:flex-row lg:items-center lg:gap-12"}`}>
        <div className="max-w-md">
          <div className="flex items-center gap-3 mb-4">
            <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
            <span className="text-white/80 font-bold uppercase tracking-widest text-[10px] sm:text-xs">
              Official Exam Countdown
            </span>
          </div>
          <h3 className={`font-bold text-white mb-2 leading-tight ${compact ? "text-xl" : "text-3xl sm:text-4xl"}`}>
            {current.label}
          </h3>
          <p className={`text-blue-50/70 font-medium ${compact ? "text-sm" : "text-lg"}`}>
            {new Date(current.date).toLocaleDateString("en-LK", { day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>

        <div className={compact ? "scale-90 origin-left" : ""}>
          <Timer date={current.date} />
        </div>
      </div>
    </div>
  );

  if (compact) return content;

  return (
    <section className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {content}
      </div>
    </section>
  );
}
