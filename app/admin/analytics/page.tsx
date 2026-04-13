"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowDownTrayIcon, EyeIcon, UsersIcon, DocumentTextIcon,
  StarIcon, InboxArrowDownIcon, FlagIcon, ArrowTrendingUpIcon,
} from "@heroicons/react/24/outline";

interface Overview {
  totalResources: number;
  totalUsers: number;
  totalDownloads: number;
  totalViews: number;
  avgRating: number;
  totalRatings: number;
  pendingRequests: number;
  fulfilledRequests: number;
  rejectedRequests: number;
  pendingReports: number;
}
interface SubjectStat  { name: string; color?: string; count: number; downloads: number; views: number }
interface CategoryStat { name: string; count: number; downloads: number }
interface MediumStat   { _id: string; count: number; downloads: number }
interface TopResource  { title: string; slug: string; downloadCount: number; viewCount: number; ratingAvg: number; medium: string; year?: number; subject: { name: string; color?: string }; category: { name: string } }
interface MonthStat    { label: string; count: number }

interface Analytics {
  overview: Overview;
  resourcesBySubject: SubjectStat[];
  resourcesByCategory: CategoryStat[];
  resourcesByMedium: MediumStat[];
  topResources: TopResource[];
  usersByMonth: MonthStat[];
  resourcesByMonth: MonthStat[];
}

// ── Reusable bar chart components ─────────────────────────────────────────────
function HBar({ label, value, max, color = "bg-blue-500", sub }: {
  label: string; value: number; max: number; color?: string; sub?: string;
}) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="flex items-center gap-3 group">
      <div className="w-32 shrink-0 text-right">
        <span className="text-xs text-gray-600 font-medium truncate block">{label}</span>
        {sub && <span className="text-[10px] text-gray-400">{sub}</span>}
      </div>
      <div className="flex-1 bg-gray-100 rounded-full h-5 overflow-hidden">
        <div
          className={`h-full rounded-full ${color} transition-all duration-500`}
          style={{ width: `${Math.max(pct, 2)}%` }}
        />
      </div>
      <span className="w-14 shrink-0 text-xs font-semibold text-gray-700 text-right tabular-nums">
        {value.toLocaleString()}
      </span>
    </div>
  );
}

function VBar({ label, value, max }: { label: string; value: number; max: number }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="flex flex-col items-center gap-1 flex-1 min-w-0">
      <span className="text-xs font-semibold text-gray-700 tabular-nums">{value}</span>
      <div className="w-full bg-gray-100 rounded-t-md overflow-hidden" style={{ height: 80 }}>
        <div
          className="w-full bg-blue-500 rounded-t-md transition-all duration-500"
          style={{ height: `${Math.max(pct, 2)}%`, marginTop: `${100 - Math.max(pct, 2)}%` }}
        />
      </div>
      <span className="text-[10px] text-gray-500 text-center leading-tight">{label}</span>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, sub, color = "bg-blue-50 text-blue-600", href }: {
  icon: React.ElementType; label: string; value: string | number; sub?: string;
  color?: string; href?: string;
}) {
  const content = (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-card hover:shadow-card-hover transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="text-2xl font-semibold text-gray-900 tabular-nums">
        {typeof value === "number" ? value.toLocaleString() : value}
      </div>
      <div className="text-sm text-gray-500 mt-0.5">{label}</div>
      {sub && <div className="text-xs text-gray-400 mt-1">{sub}</div>}
    </div>
  );
  return href ? <Link href={href}>{content}</Link> : content;
}

const MEDIUM_COLORS: Record<string, string> = {
  sinhala: "bg-blue-500",
  tamil:   "bg-violet-500",
  english: "bg-emerald-500",
};
const MEDIUM_LABELS: Record<string, string> = { sinhala: "Sinhala", tamil: "Tamil", english: "English" };

export default function AnalyticsPage() {
  const [data, setData]     = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState("");

  useEffect(() => {
    fetch("/api/admin/analytics")
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => { setError("Failed to load analytics"); setLoading(false); });
  }, []);

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 w-48 bg-gray-200 rounded-xl" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-28 bg-gray-200 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return <div className="p-8 text-center text-red-500">{error || "No data"}</div>;
  }

  const { overview, resourcesBySubject, resourcesByCategory, resourcesByMedium, topResources, usersByMonth, resourcesByMonth } = data;

  const maxSubjectDownloads = Math.max(...resourcesBySubject.map(s => s.downloads), 1);
  const maxSubjectCount     = Math.max(...resourcesBySubject.map(s => s.count), 1);
  const maxCategoryCount    = Math.max(...resourcesByCategory.map(c => c.count), 1);
  const maxTopDownloads     = Math.max(...topResources.map(r => r.downloadCount), 1);
  const maxUsers            = Math.max(...usersByMonth.map(m => m.count), 1);
  const maxResMonthly       = Math.max(...resourcesByMonth.map(m => m.count), 1);
  const totalMedium         = resourcesByMedium.reduce((s, m) => s + m.count, 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <ArrowTrendingUpIcon className="w-6 h-6 text-blue-600" />
          Analytics
        </h1>
        <p className="text-sm text-gray-500 mt-1">Platform performance overview</p>
      </div>

      {/* Overview cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={DocumentTextIcon} label="Total Resources"  value={overview.totalResources}  color="bg-blue-50 text-blue-600"   href="/admin/resources" />
        <StatCard icon={UsersIcon}        label="Students"         value={overview.totalUsers}       color="bg-violet-50 text-violet-600" href="/admin/users" />
        <StatCard icon={ArrowDownTrayIcon} label="Total Downloads" value={overview.totalDownloads}   color="bg-emerald-50 text-emerald-600" />
        <StatCard icon={EyeIcon}          label="Total Views"      value={overview.totalViews}       color="bg-cyan-50 text-cyan-600" />
        <StatCard
          icon={StarIcon}
          label="Avg Rating"
          value={overview.avgRating > 0 ? overview.avgRating.toFixed(2) : "—"}
          sub={`${overview.totalRatings.toLocaleString()} ratings`}
          color="bg-amber-50 text-amber-600"
        />
        <StatCard
          icon={InboxArrowDownIcon}
          label="Requests"
          value={overview.pendingRequests}
          sub={`${overview.fulfilledRequests} fulfilled · ${overview.rejectedRequests} rejected`}
          color="bg-orange-50 text-orange-600"
          href="/admin/requests"
        />
        <StatCard
          icon={FlagIcon}
          label="Pending Reports"
          value={overview.pendingReports}
          color={overview.pendingReports > 0 ? "bg-red-50 text-red-600" : "bg-gray-50 text-gray-400"}
          href="/admin/reports"
        />
      </div>

      {/* Monthly trends */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* New students per month */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-card">
          <h2 className="font-bold text-gray-900 mb-5 text-sm uppercase tracking-wide">
            New Students — Last 6 Months
          </h2>
          <div className="flex items-end gap-2 h-28">
            {usersByMonth.map(m => (
              <VBar key={m.label} label={m.label} value={m.count} max={maxUsers} />
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-3 text-right">
            Total: {usersByMonth.reduce((s, m) => s + m.count, 0).toLocaleString()} new registrations
          </p>
        </div>

        {/* Resources uploaded per month */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-card">
          <h2 className="font-bold text-gray-900 mb-5 text-sm uppercase tracking-wide">
            Resources Uploaded — Last 6 Months
          </h2>
          <div className="flex items-end gap-2 h-28">
            {resourcesByMonth.map(m => (
              <VBar key={m.label} label={m.label} value={m.count} max={maxResMonthly} />
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-3 text-right">
            Total: {resourcesByMonth.reduce((s, m) => s + m.count, 0).toLocaleString()} uploaded
          </p>
        </div>
      </div>

      {/* Downloads by subject */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-card">
        <h2 className="font-bold text-gray-900 mb-5 text-sm uppercase tracking-wide">Downloads by Subject</h2>
        <div className="space-y-3">
          {resourcesBySubject.map(s => (
            <HBar
              key={s.name}
              label={s.name}
              value={s.downloads}
              max={maxSubjectDownloads}
              color="bg-blue-500"
              sub={`${s.count} resource${s.count !== 1 ? "s" : ""}`}
            />
          ))}
          {resourcesBySubject.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-4">No data yet.</p>
          )}
        </div>
      </div>

      {/* Resources count by subject + medium breakdown side by side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Resources count by subject */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-card">
          <h2 className="font-bold text-gray-900 mb-5 text-sm uppercase tracking-wide">Resources by Subject</h2>
          <div className="space-y-3">
            {resourcesBySubject.map(s => (
              <HBar
                key={s.name}
                label={s.name}
                value={s.count}
                max={maxSubjectCount}
                color="bg-violet-500"
              />
            ))}
          </div>
        </div>

        {/* Medium breakdown */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-card">
          <h2 className="font-bold text-gray-900 mb-5 text-sm uppercase tracking-wide">Resources by Medium</h2>
          <div className="space-y-4">
            {resourcesByMedium.map(m => {
              const pct = totalMedium > 0 ? Math.round((m.count / totalMedium) * 100) : 0;
              return (
                <div key={m._id}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium text-gray-700 capitalize">{MEDIUM_LABELS[m._id] || m._id}</span>
                    <span className="text-gray-400">{m.count.toLocaleString()} ({pct}%)</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${MEDIUM_COLORS[m._id] || "bg-gray-400"}`}
                      style={{ width: `${Math.max(pct, 2)}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-gray-400 mt-0.5">{m.downloads.toLocaleString()} downloads</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Resources by category */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-card">
        <h2 className="font-bold text-gray-900 mb-5 text-sm uppercase tracking-wide">Resources by Category (Top 10)</h2>
        <div className="space-y-3">
          {resourcesByCategory.map(c => (
            <HBar
              key={c.name}
              label={c.name}
              value={c.count}
              max={maxCategoryCount}
              color="bg-emerald-500"
              sub={`${c.downloads.toLocaleString()} downloads`}
            />
          ))}
        </div>
      </div>

      {/* Top 10 most downloaded */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-card">
        <h2 className="font-bold text-gray-900 mb-5 text-sm uppercase tracking-wide">Top 10 Most Downloaded Resources</h2>
        <div className="space-y-3">
          {topResources.map((r, i) => (
            <div key={r.slug} className="flex items-center gap-3">
              <span className="w-6 text-xs font-bold text-gray-300 text-right shrink-0">{i + 1}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-medium text-gray-900 truncate">{r.title}</p>
                  <span
                    className="badge text-white text-[10px] shrink-0"
                    style={{ backgroundColor: r.subject?.color || "#15803d" }}
                  >
                    {r.subject?.name}
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-orange-400 transition-all duration-500"
                    style={{ width: `${Math.max(Math.round((r.downloadCount / maxTopDownloads) * 100), 2)}%` }}
                  />
                </div>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-sm font-bold text-gray-700 tabular-nums">{r.downloadCount.toLocaleString()}</p>
                <p className="text-[10px] text-gray-400">{r.viewCount.toLocaleString()} views</p>
              </div>
            </div>
          ))}
          {topResources.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-4">No resources yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
