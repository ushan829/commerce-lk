"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import {
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  FunnelIcon,
  InboxIcon,
} from "@heroicons/react/24/outline";

interface ResourceRequest {
  _id: string;
  userName: string;
  userEmail: string;
  subject: string;
  medium: string;
  category: string;
  title: string;
  year?: number;
  notes?: string;
  status: "pending" | "fulfilled" | "rejected";
  adminNote?: string;
  createdAt: string;
}

const STATUS_CONFIG = {
  pending: { label: "Pending", icon: ClockIcon, cls: "bg-yellow-100 text-yellow-700" },
  fulfilled: { label: "Fulfilled", icon: CheckCircleIcon, cls: "bg-green-100 text-green-700" },
  rejected: { label: "Rejected", icon: XCircleIcon, cls: "bg-red-100 text-red-700" },
};

export default function AdminRequestsPage() {
  const [requests, setRequests] = useState<ResourceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);
  const [noteModal, setNoteModal] = useState<{ id: string; status: string; note: string } | null>(null);

  useEffect(() => {
    fetchRequests();
  }, [filter]);

  async function fetchRequests() {
    setLoading(true);
    try {
      const qs = filter ? `?status=${filter}` : "";
      const res = await fetch(`/api/admin/requests${qs}`);
      const data = await res.json();
      if (data.requests) setRequests(data.requests);
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(id: string, status: string, adminNote = "") {
    setUpdating(id);
    try {
      const res = await fetch(`/api/admin/requests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, adminNote }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setRequests((prev) =>
        prev.map((r) => r._id === id ? { ...r, status: data.request.status, adminNote: data.request.adminNote } : r)
      );
      toast.success(`Marked as ${status}`);
      setNoteModal(null);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Update failed");
    } finally {
      setUpdating(null);
    }
  }

  const counts = {
    all: requests.length,
    pending: requests.filter((r) => r.status === "pending").length,
    fulfilled: requests.filter((r) => r.status === "fulfilled").length,
    rejected: requests.filter((r) => r.status === "rejected").length,
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Resource Requests</h1>
        <p className="text-sm text-gray-500 mt-1">Manage student resource requests</p>
      </div>

      {/* Stat pills */}
      <div className="flex flex-wrap gap-2 mb-5">
        {([
          ["", "All", counts.all, "bg-gray-100 text-gray-700"],
          ["pending", "Pending", counts.pending, "bg-yellow-100 text-yellow-700"],
          ["fulfilled", "Fulfilled", counts.fulfilled, "bg-green-100 text-green-700"],
          ["rejected", "Rejected", counts.rejected, "bg-red-100 text-red-700"],
        ] as [string, string, number, string][]).map(([val, label, count, cls]) => (
          <button
            key={val}
            onClick={() => setFilter(val)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
              filter === val ? `${cls} ring-2 ring-offset-1 ring-current` : cls
            }`}
          >
            <FunnelIcon className="w-3.5 h-3.5" />
            {label}
            <span className="font-bold">{count}</span>
          </button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-3">
        {loading ? (
          <div className="card p-8 text-center text-gray-400">
            <div className="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full mx-auto" />
          </div>
        ) : requests.length === 0 ? (
          <div className="card p-12 text-center text-gray-400">
            <InboxIcon className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p className="font-medium">No requests{filter ? ` with status "${filter}"` : ""}</p>
          </div>
        ) : (
          requests.map((req) => {
            const cfg = STATUS_CONFIG[req.status];
            const StatusIcon = cfg.icon;
            return (
              <div key={req._id} className="card p-5">
                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                  <div className="flex-1 min-w-0">
                    {/* Header row */}
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${cfg.cls}`}>
                        <StatusIcon className="w-3 h-3" />
                        {cfg.label}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(req.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                      </span>
                    </div>

                    {/* Title */}
                    <p className="font-semibold text-gray-800">{req.title}</p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{req.subject}</span>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{req.category}</span>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full capitalize">{req.medium}</span>
                      {req.year && <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{req.year}</span>}
                    </div>

                    {/* Notes */}
                    {req.notes && (
                      <p className="text-sm text-gray-500 mt-2">{req.notes}</p>
                    )}

                    {/* User info */}
                    <p className="text-xs text-gray-400 mt-2">
                      From: <span className="text-gray-600 font-medium">{req.userName}</span>
                      {" · "}
                      <span>{req.userEmail}</span>
                    </p>

                    {/* Admin note */}
                    {req.adminNote && (
                      <div className="mt-2 p-2 bg-blue-50 rounded-lg border border-blue-100 text-xs text-blue-700">
                        <strong>Admin note:</strong> {req.adminNote}
                      </div>
                    )}
                  </div>

                  {/* Action buttons */}
                  {req.status === "pending" && (
                    <div className="flex flex-row sm:flex-col gap-2 shrink-0">
                      <button
                        disabled={updating === req._id}
                        onClick={() => setNoteModal({ id: req._id, status: "fulfilled", note: req.adminNote || "" })}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50"
                      >
                        <CheckCircleIcon className="w-4 h-4" />
                        Fulfill
                      </button>
                      <button
                        disabled={updating === req._id}
                        onClick={() => setNoteModal({ id: req._id, status: "rejected", note: req.adminNote || "" })}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50"
                      >
                        <XCircleIcon className="w-4 h-4" />
                        Reject
                      </button>
                    </div>
                  )}
                  {req.status !== "pending" && (
                    <button
                      disabled={updating === req._id}
                      onClick={() => updateStatus(req._id, "pending")}
                      className="shrink-0 text-xs text-gray-500 hover:text-gray-700 underline"
                    >
                      Reset to pending
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Note modal */}
      {noteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setNoteModal(null)} />
          <div className="relative bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
            <h3 className="font-semibold text-gray-800 mb-4 capitalize">
              {noteModal.status === "fulfilled" ? "✅" : "❌"} Mark as {noteModal.status}
            </h3>
            <label className="label">Admin Note (optional)</label>
            <textarea
              className="input resize-none mb-4" rows={3}
              placeholder={noteModal.status === "fulfilled" ? "e.g. Resource uploaded at /accounting/sinhala/..." : "e.g. We don't have this resource available"}
              value={noteModal.note}
              onChange={(e) => setNoteModal({ ...noteModal, note: e.target.value })}
            />
            <div className="flex gap-3">
              <button
                onClick={() => updateStatus(noteModal.id, noteModal.status, noteModal.note)}
                className={`btn-primary py-2 px-5 ${noteModal.status === "rejected" ? "bg-red-600 hover:bg-red-700 border-red-600" : ""}`}
              >
                Confirm
              </button>
              <button onClick={() => setNoteModal(null)} className="btn-secondary py-2 px-5">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
