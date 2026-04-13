"use client";

import { useState, useEffect } from "react";
import {
  ArrowDownTrayIcon, FireIcon, StarIcon,
  AcademicCapIcon, TrophyIcon, BookOpenIcon,
  ClockIcon, CalendarDaysIcon,
} from "@heroicons/react/24/outline";

interface StatsData {
  totalDownloads: number;
  monthlyDownloads: number;
  bookmarkCount: number;
  daysActive: number;
  streak: number;
  ratingsGiven: number;
  rank: string;
  mostDownloadedSubject: string | null;
  currentlyStudying: string | null;
}

interface ActivityItem {
  type: "download" | "rating";
  title: string;
  timestamp: string;
  rating?: number;
}

const RANK_CONFIG: Record<string, { color: string; bg: string; border: string; progress: string }> = {
  Bronze:   { color: "text-amber-700",  bg: "from-amber-50 to-orange-50",   border: "border-amber-200",  progress: "from-amber-400 to-orange-400" },
  Silver:   { color: "text-slate-600",  bg: "from-slate-50 to-gray-100",    border: "border-slate-300",  progress: "from-slate-400 to-gray-500" },
  Gold:     { color: "text-yellow-600", bg: "from-yellow-50 to-amber-50",   border: "border-yellow-300", progress: "from-yellow-400 to-amber-400" },
  Platinum: { color: "text-indigo-600", bg: "from-indigo-50 to-purple-50",  border: "border-indigo-200", progress: "from-indigo-500 to-purple-500" },
};
const RANK_DESCS: Record<string, string> = {
  Bronze: "Keep downloading to level up!",
  Silver: "Great progress — aim for Gold!",
  Gold: "You're a dedicated learner!",
  Platinum: "Elite student status achieved!",
};
const RANK_THRESHOLDS = [
  { label: "Silver", min: 11 }, { label: "Gold", min: 51 },
  { label: "Platinum", min: 100 },
];

function timeAgo(ts: string) {
  const diff = Date.now() - new Date(ts).getTime();
  const m = Math.floor(diff / 60000), h = Math.floor(diff / 3600000), d = Math.floor(diff / 86400000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  if (h < 24) return `${h}h ago`;
  if (d === 1) return "yesterday";
  return `${d}d ago`;
}

const STUDY_TIPS = [
  "Review past papers from the last 5 years — they predict 70% of exam questions.",
  "Explain a concept to someone else to test if you truly understand it.",
  "Take a 10-minute break every 45 minutes of study for better retention.",
  "Focus on weak areas first when time is limited.",
  "Read marking schemes to understand what examiners are looking for.",
  "Make summary notes after each topic for quick revision.",
  "Practise calculations daily — don't leave them for the night before.",
];

export default function StatsSection() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [examDays, setExamDays] = useState<number | null>(null);
  const [examLabel, setExamLabel] = useState("");
  const [loading, setLoading] = useState(true);

  const tip = STUDY_TIPS[new Date().getDate() % STUDY_TIPS.length];

  useEffect(() => {
    Promise.all([
      fetch("/api/user/stats").then(r => r.json()),
      fetch("/api/user/activity").then(r => r.json()),
      fetch("/api/exam-dates").then(r => r.json()),
    ]).then(([s, a, e]) => {
      if (s.totalDownloads !== undefined) setStats(s);
      if (a.activities) setActivities(a.activities);
      if (e.examDates?.length) {
        const upcoming = [...e.examDates]
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .filter((ex: any) => new Date(ex.date) > new Date())
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
        if (upcoming.length) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          setExamDays(Math.ceil((new Date((upcoming[0] as any).date).getTime() - Date.now()) / 86400000));
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          setExamLabel((upcoming[0] as any).label);
        }
      }
    }).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-24 rounded-2xl bg-gray-100 animate-pulse" />
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-28 rounded-2xl bg-gray-100 animate-pulse" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-64 rounded-2xl bg-gray-100 animate-pulse" />
          <div className="space-y-4">
            <div className="h-40 rounded-2xl bg-gray-100 animate-pulse" />
            <div className="h-24 rounded-2xl bg-gray-100 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  const rank = stats?.rank || "Bronze";
  const rc = RANK_CONFIG[rank] || RANK_CONFIG.Bronze;
  const totalDl = stats?.totalDownloads ?? 0;
  const nextThreshold = RANK_THRESHOLDS.find(t => totalDl < t.min);
  const progressPct = nextThreshold ? Math.min(100, (totalDl / nextThreshold.min) * 100) : 100;
  const progressLabel = nextThreshold ? `${totalDl} / ${nextThreshold.min} to ${nextThreshold.label}` : "Max rank reached!";

  const statCards = [
    { icon: <ArrowDownTrayIcon className="w-5 h-5" />, label: "Downloads This Month", value: stats?.monthlyDownloads ?? 0, grad: "from-blue-500 to-blue-600", bg: "from-blue-50 to-blue-100/80" },
    { icon: <BookOpenIcon className="w-5 h-5" />,       label: "Most Downloaded",       value: stats?.mostDownloadedSubject ?? "—", grad: "from-purple-500 to-purple-600", bg: "from-purple-50 to-purple-100/80", small: true },
    { icon: <FireIcon className="w-5 h-5" />,           label: "Study Streak",           value: `${stats?.streak ?? 0} days`,       grad: "from-orange-500 to-red-500",    bg: "from-orange-50 to-red-50" },
    { icon: <StarIcon className="w-5 h-5" />,           label: "Resources Rated",        value: stats?.ratingsGiven ?? 0,           grad: "from-amber-400 to-yellow-500",  bg: "from-amber-50 to-yellow-50" },
    { icon: <AcademicCapIcon className="w-5 h-5" />,    label: "Currently Studying",     value: stats?.currentlyStudying ?? "—",    grad: "from-green-500 to-emerald-500", bg: "from-green-50 to-emerald-50/80", small: true },
    { icon: <TrophyIcon className="w-5 h-5" />,         label: "Total Downloads",        value: totalDl,                            grad: "from-indigo-500 to-indigo-600", bg: "from-indigo-50 to-indigo-100/80" },
  ];

  return (
    <div className="space-y-6">
      {/* Rank badge */}
      <div className={`bg-gradient-to-r ${rc.bg} border ${rc.border} rounded-2xl p-5 flex items-center gap-5`}>
        <div className="text-5xl select-none">🏆</div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-0.5">Your Rank</p>
          <p className={`text-2xl font-bold ${rc.color}`}>{rank}</p>
          <p className="text-sm text-gray-500">{RANK_DESCS[rank]}</p>
        </div>
        <div className="hidden sm:block text-right shrink-0 w-40">
          <p className="text-xs text-gray-400 mb-1">{progressLabel}</p>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className={`h-full bg-gradient-to-r ${rc.progress} rounded-full transition-all duration-700`}
              style={{ width: `${progressPct}%` }} />
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {statCards.map((c, i) => (
          <div key={i} className={`bg-gradient-to-br ${c.bg} border border-gray-100 rounded-2xl p-4`}>
            <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${c.grad} text-white flex items-center justify-center mb-3`}>
              {c.icon}
            </div>
            <p className={`font-bold text-gray-900 ${c.small ? "text-sm truncate" : "text-2xl"}`}>{c.value}</p>
            <p className="text-xs text-gray-500 mt-0.5 leading-tight">{c.label}</p>
          </div>
        ))}
      </div>

      {/* Activity + Planner */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity feed */}
        <div className="lg:col-span-2 bg-white border border-gray-100 rounded-2xl p-5 shadow-card">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <ClockIcon className="w-5 h-5 text-emerald-500" />
            Recent Activity
          </h3>
          {activities.length === 0 ? (
            <div className="py-10 text-center">
              <ClockIcon className="w-10 h-10 mx-auto mb-2 text-gray-200" />
              <p className="text-sm text-gray-400">No activity yet. Start downloading resources!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activities.map((a, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className={`mt-0.5 w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    a.type === "download" ? "bg-blue-100 text-blue-600" : "bg-amber-100 text-amber-600"
                  }`}>
                    {a.type === "download"
                      ? <ArrowDownTrayIcon className="w-4 h-4" />
                      : <StarIcon className="w-4 h-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-800 line-clamp-1">
                      <span className="font-medium">
                        {a.type === "download" ? "Downloaded" : `Rated ${"⭐".repeat(a.rating ?? 0)}`}
                      </span>{" "}
                      &ldquo;{a.title}&rdquo;
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">{timeAgo(a.timestamp)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Planner column */}
        <div className="space-y-4">
          {/* Exam countdown */}
          <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-2xl p-5 text-white">
            <div className="flex items-center gap-2 mb-2">
              <CalendarDaysIcon className="w-4 h-4 text-blue-200" />
              <p className="text-xs text-blue-200 font-medium uppercase tracking-wide">Exam Countdown</p>
            </div>
            {examDays !== null ? (
              <>
                <p className="text-4xl font-bold">{examDays}</p>
                <p className="text-sm text-blue-200">days until {examLabel}</p>
                <div className="mt-3 pt-3 border-t border-white/10">
                  <p className="text-xs text-blue-200">Suggested goal today</p>
                  <p className="text-sm font-semibold mt-0.5">Download 2 resources 📥</p>
                </div>
              </>
            ) : (
              <p className="text-sm text-blue-200 mt-1">No upcoming exams scheduled.</p>
            )}
          </div>

          {/* Study tip */}
          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5">
            <p className="text-xs font-semibold text-amber-600 uppercase tracking-wide mb-2">💡 Today&apos;s Tip</p>
            <p className="text-sm text-gray-700 leading-relaxed">&ldquo;{tip}&rdquo;</p>
          </div>
        </div>
      </div>
    </div>
  );
}
