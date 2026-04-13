"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  FlagIcon, CheckCircleIcon, TrashIcon,
  ArrowTopRightOnSquareIcon, FunnelIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

interface Report {
  _id: string;
  resourceSlug: string;
  resourceTitle: string;
  subjectName?: string;
  reason: string;
  description?: string;
  reporterEmail?: string;
  status: "pending" | "reviewed";
  adminNote?: string;
  createdAt: string;
}

const REASON_LABELS: Record<string, string> = {
  "broken-file":    "Broken file",
  "wrong-content":  "Wrong content",
  "incorrect-year": "Incorrect year",
  "duplicate":      "Duplicate",
  "other":          "Other",
};

const REASON_COLORS: Record<string, string> = {
  "broken-file":    "bg-red-100 text-red-700",
  "wrong-content":  "bg-orange-100 text-orange-700",
  "incorrect-year": "bg-yellow-100 text-yellow-700",
  "duplicate":      "bg-purple-100 text-purple-700",
  "other":          "bg-gray-100 text-gray-600",
};

export default function AdminReportsPage() {
  const [reports, setReports]   = useState<Report[]>([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState<"pending" | "reviewed" | "all">("pending");
  const [noteFor, setNoteFor]   = useState<string | null>(null);
  const [noteText, setNoteText] = useState("");

  const load = (status: string) => {
    setLoading(true);
    fetch(`/api/admin/reports?status=${status}`)
      .then(r => r.json())
      .then(d => { setReports(d.reports || []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { load(filter); }, [filter]);

  const markReviewed = async (id: string, note?: string) => {
    const res = await fetch(`/api/admin/reports/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "reviewed", adminNote: note || "" }),
    });
    if (res.ok) { toast.success("Marked as reviewed"); load(filter); setNoteFor(null); setNoteText(""); }
    else toast.error("Failed");
  };

  const deleteReport = async (id: string) => {
    if (!confirm("Delete this report?")) return;
    await fetch(`/api/admin/reports/${id}`, { method: "DELETE" });
    toast.success("Deleted");
    load(filter);
  };

  const pendingCount = filter === "pending" ? reports.length : undefined;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FlagIcon className="w-6 h-6 text-red-500" />
            File Reports
          </h1>
          <p className="text-sm text-gray-500 mt-1">Issues reported by students about resource files</p>
        </div>
        {pendingCount !== undefined && pendingCount > 0 && (
          <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-semibold">
            {pendingCount} pending
          </span>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 mb-5 bg-gray-100 p-1 rounded-xl w-fit">
        {(["pending", "reviewed", "all"] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors ${
              filter === f ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-gray-400">Loading…</div>
        ) : reports.length === 0 ? (
          <div className="p-10 text-center text-gray-400">
            <FlagIcon className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p>No {filter !== "all" ? filter : ""} reports.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {reports.map(report => (
              <div key={report._id} className="p-5">
                <div className="flex items-start gap-4">
                  <div className="flex-1 min-w-0">
                    {/* Resource link */}
                    <div className="flex items-start gap-2 mb-2">
                      <div>
                        <p className="font-semibold text-gray-900 leading-snug">{report.resourceTitle}</p>
                        {report.subjectName && (
                          <p className="text-xs text-gray-400 mt-0.5">{report.subjectName}</p>
                        )}
                      </div>
                      <Link
                        href={`/${report.resourceSlug.split("/").slice(0, 3).join("/")}/${report.resourceSlug.split("/").pop()}`}
                        target="_blank"
                        className="shrink-0 p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                        title="View resource"
                      >
                        <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                      </Link>
                    </div>

                    {/* Reason + meta */}
                    <div className="flex flex-wrap gap-2 mb-2">
                      <span className={`badge text-xs ${REASON_COLORS[report.reason] || "bg-gray-100 text-gray-600"}`}>
                        {REASON_LABELS[report.reason] || report.reason}
                      </span>
                      <span className={`badge text-xs ${report.status === "pending" ? "bg-yellow-100 text-yellow-700" : "bg-green-100 text-green-700"}`}>
                        {report.status}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(report.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                      </span>
                      {report.reporterEmail && (
                        <a href={`mailto:${report.reporterEmail}`} className="text-xs text-blue-600 hover:underline">
                          {report.reporterEmail}
                        </a>
                      )}
                    </div>

                    {/* Description */}
                    {report.description && (
                      <p className="text-sm text-gray-600 bg-gray-50 rounded-lg px-3 py-2 mb-2 leading-relaxed">
                        {report.description}
                      </p>
                    )}

                    {/* Admin note */}
                    {report.adminNote && (
                      <p className="text-xs text-gray-500 italic">Admin note: {report.adminNote}</p>
                    )}

                    {/* Inline note input when marking reviewed */}
                    {noteFor === report._id && (
                      <div className="mt-3 flex gap-2">
                        <input
                          className="input text-sm flex-1 py-2"
                          placeholder="Add an internal note (optional)…"
                          value={noteText}
                          onChange={e => setNoteText(e.target.value)}
                          autoFocus
                        />
                        <button
                          onClick={() => markReviewed(report._id, noteText)}
                          className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => { setNoteFor(null); setNoteText(""); }}
                          className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm font-medium rounded-lg"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    {report.status === "pending" && noteFor !== report._id && (
                      <button
                        onClick={() => setNoteFor(report._id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 hover:bg-green-100 text-green-700 text-xs font-medium rounded-lg transition-colors"
                      >
                        <CheckCircleIcon className="w-4 h-4" />
                        Mark reviewed
                      </button>
                    )}
                    <button
                      onClick={() => deleteReport(report._id)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center gap-2 text-xs text-gray-400">
        <FunnelIcon className="w-3.5 h-3.5" />
        Tip: after reviewing a report, visit the resource page and use the admin edit to fix or remove the file.
      </div>
    </div>
  );
}
