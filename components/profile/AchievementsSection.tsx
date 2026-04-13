"use client";

import { useState, useEffect } from "react";
import { TrophyIcon } from "@heroicons/react/24/outline";

interface Achievement {
  id: string;
  name: string;
  description: string;
  emoji: string;
  earned: boolean;
  earnedAt?: string;
}

export default function AchievementsSection() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/user/achievements")
      .then(r => r.json())
      .then(d => { if (d.achievements) setAchievements(d.achievements); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 7 }).map((_, i) => <div key={i} className="h-36 rounded-2xl bg-gray-100 animate-pulse" />)}
      </div>
    );
  }

  const earned = achievements.filter(a => a.earned);

  return (
    <div>
      {/* Progress header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <TrophyIcon className="w-5 h-5 text-amber-500" />
          <span className="font-bold text-gray-900">Achievements</span>
          <span className="text-sm text-gray-500">— {earned.length}/{achievements.length} unlocked</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-700"
              style={{ width: achievements.length ? `${(earned.length / achievements.length) * 100}%` : "0%" }}
            />
          </div>
          <span className="text-xs text-gray-400">{achievements.length ? Math.round((earned.length / achievements.length) * 100) : 0}%</span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {achievements.map(a => (
          <div
            key={a.id}
            className={`relative rounded-2xl p-5 text-center border transition-all ${
              a.earned
                ? "bg-gradient-to-br from-white to-indigo-50/60 border-indigo-100 shadow-card"
                : "bg-gray-50 border-gray-100"
            }`}
          >
            {/* Emoji */}
            <div className={`text-4xl mb-2 leading-none ${!a.earned ? "grayscale opacity-40" : ""}`}>
              {a.emoji}
            </div>
            <p className={`font-bold text-sm ${a.earned ? "text-gray-900" : "text-gray-400"}`}>{a.name}</p>
            <p className={`text-xs mt-1 leading-tight ${a.earned ? "text-gray-500" : "text-gray-300"}`}>{a.description}</p>

            {a.earned ? (
              <span className="mt-2.5 inline-block text-[10px] font-semibold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                Unlocked ✓
              </span>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center rounded-2xl pointer-events-none">
                <span className="text-3xl opacity-20 select-none">🔒</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {earned.length === achievements.length && achievements.length > 0 && (
        <div className="mt-6 text-center bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 rounded-2xl py-5 px-4">
          <p className="text-2xl mb-1">🎉</p>
          <p className="font-bold text-indigo-700">All achievements unlocked!</p>
          <p className="text-sm text-indigo-500 mt-0.5">You&apos;re a Commerce.lk champion!</p>
        </div>
      )}
    </div>
  );
}
