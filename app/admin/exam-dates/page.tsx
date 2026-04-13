"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import {
  ClockIcon,
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";

interface ExamDate {
  id: string;
  label: string;
  date: string;
  subject?: string;
  isActive: boolean;
}

const EMPTY: Omit<ExamDate, "id"> = {
  label: "",
  date: "",
  subject: "",
  isActive: true,
};

function daysUntil(dateStr: string) {
  const diff = new Date(dateStr).getTime() - Date.now();
  if (diff <= 0) return null;
  return Math.ceil(diff / 86400000);
}

export default function ExamDatesPage() {
  const [examDates, setExamDates] = useState<ExamDate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<ExamDate, "id">>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    loadDates();
  }, []);

  async function loadDates() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/exam-dates");
      const data = await res.json();
      if (res.ok) setExamDates(data.examDates || []);
    } finally {
      setLoading(false);
    }
  }

  function openAdd() {
    setEditId(null);
    setForm(EMPTY);
    setShowForm(true);
  }

  function openEdit(d: ExamDate) {
    setEditId(d.id);
    setForm({ label: d.label, date: d.date, subject: d.subject || "", isActive: d.isActive });
    setShowForm(true);
  }

  async function handleSave() {
    if (!form.label.trim() || !form.date) {
      toast.error("Label and date are required");
      return;
    }
    setSaving(true);
    try {
      const url = editId ? `/api/admin/exam-dates/${editId}` : "/api/admin/exam-dates";
      const method = editId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(editId ? "Updated!" : "Exam date added!");
      setShowForm(false);
      loadDates();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this exam date?")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/exam-dates/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed");
      toast.success("Deleted");
      setExamDates((prev) => prev.filter((d) => d.id !== id));
    } catch {
      toast.error("Failed to delete");
    } finally {
      setDeletingId(null);
    }
  }

  async function toggleActive(d: ExamDate) {
    try {
      const res = await fetch(`/api/admin/exam-dates/${d.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !d.isActive }),
      });
      if (!res.ok) throw new Error();
      setExamDates((prev) =>
        prev.map((e) => (e.id === d.id ? { ...e, isActive: !e.isActive } : e))
      );
    } catch {
      toast.error("Failed to update");
    }
  }

  const sorted = [...examDates].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  return (
    <div className="max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Exam Countdown</h1>
          <p className="text-sm text-gray-500 mt-1">Manage exam dates shown on the site countdown banner</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2 py-2 px-4">
          <PlusIcon className="w-4 h-4" />
          Add Exam Date
        </button>
      </div>

      {/* Add / Edit form */}
      {showForm && (
        <div className="card p-6 mb-6 border-2 border-blue-200">
          <h2 className="font-semibold text-gray-900 mb-4">
            {editId ? "Edit Exam Date" : "Add Exam Date"}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div className="sm:col-span-2">
              <label className="label">Label *</label>
              <input
                type="text"
                className="input"
                placeholder="e.g. A/L 2025 Combined Mathematics"
                value={form.label}
                onChange={(e) => setForm((p) => ({ ...p, label: e.target.value }))}
              />
            </div>
            <div>
              <label className="label">Exam Date *</label>
              <input
                type="date"
                className="input"
                value={form.date}
                onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))}
              />
            </div>
            <div>
              <label className="label">Subject Tag (optional)</label>
              <input
                type="text"
                className="input"
                placeholder="e.g. Accounting"
                value={form.subject || ""}
                onChange={(e) => setForm((p) => ({ ...p, subject: e.target.value }))}
              />
            </div>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="isActive"
                checked={form.isActive}
                onChange={(e) => setForm((p) => ({ ...p, isActive: e.target.checked }))}
                className="w-4 h-4 rounded border-gray-300 text-blue-600"
              />
              <label htmlFor="isActive" className="text-sm text-gray-700 font-medium">
                Active (visible on site)
              </label>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="btn-primary py-2 px-5 text-sm disabled:opacity-50"
            >
              {saving ? "Saving..." : editId ? "Update" : "Add"}
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="btn-secondary py-2 px-5 text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card p-4 animate-pulse">
              <div className="h-4 bg-gray-100 rounded w-48 mb-2" />
              <div className="h-3 bg-gray-100 rounded w-32" />
            </div>
          ))}
        </div>
      ) : sorted.length === 0 ? (
        <div className="card p-12 text-center">
          <ClockIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No exam dates yet</p>
          <p className="text-sm text-gray-400 mt-1">Add exam dates to show a countdown on the site</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map((d) => {
            const days = daysUntil(d.date);
            const isPast = days === null;
            return (
              <div
                key={d.id}
                className={`card p-4 flex items-center gap-4 ${!d.isActive ? "opacity-60" : ""}`}
              >
                {/* Icon */}
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  isPast ? "bg-gray-100" : "bg-blue-50"
                }`}>
                  <ClockIcon className={`w-5 h-5 ${isPast ? "text-gray-400" : "text-blue-600"}`} />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-gray-900 text-sm">{d.label}</p>
                    {d.subject && (
                      <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                        {d.subject}
                      </span>
                    )}
                    {!d.isActive && (
                      <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Hidden</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-2">
                    <span>
                      {new Date(d.date).toLocaleDateString("en-LK", {
                        weekday: "short",
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                    {isPast ? (
                      <span className="text-red-400 font-medium">Past</span>
                    ) : (
                      <span className={`font-medium ${days! <= 30 ? "text-red-500" : "text-blue-600"}`}>
                        {days} day{days !== 1 ? "s" : ""} away
                      </span>
                    )}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => toggleActive(d)}
                    title={d.isActive ? "Hide from site" : "Show on site"}
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    {d.isActive ? (
                      <CheckCircleIcon className="w-5 h-5 text-green-500" />
                    ) : (
                      <XCircleIcon className="w-5 h-5 text-gray-400" />
                    )}
                  </button>
                  <button
                    onClick={() => openEdit(d)}
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <PencilSquareIcon className="w-5 h-5 text-gray-500" />
                  </button>
                  <button
                    onClick={() => handleDelete(d.id)}
                    disabled={deletingId === d.id}
                    className="p-2 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                  >
                    <TrashIcon className="w-5 h-5 text-red-400" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
