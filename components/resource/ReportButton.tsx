"use client";

import { useState } from "react";
import { FlagIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { FlagIcon as FlagSolid } from "@heroicons/react/24/solid";
import toast from "react-hot-toast";

const REASONS = [
  { value: "broken-file",    label: "File is broken / won't open" },
  { value: "wrong-content",  label: "Wrong content (not what it says)" },
  { value: "incorrect-year", label: "Incorrect year or term" },
  { value: "duplicate",      label: "Duplicate resource" },
  { value: "other",          label: "Other" },
];

interface Props {
  slug: string;
  title: string;
}

export default function ReportButton({ slug, title }: Props) {
  const [open, setOpen]         = useState(false);
  const [reason, setReason]     = useState("");
  const [description, setDesc]  = useState("");
  const [email, setEmail]       = useState("");
  const [submitting, setSub]    = useState(false);
  const [done, setDone]         = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!reason) return toast.error("Please select a reason");
    setSub(true);
    try {
      const res = await fetch(`/api/resources/${slug}/report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason, description, reporterEmail: email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setDone(true);
      toast.success("Report submitted — thank you!");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to submit");
    } finally {
      setSub(false);
    }
  }

  function handleClose() {
    setOpen(false);
    setTimeout(() => { setReason(""); setDesc(""); setEmail(""); setDone(false); }, 300);
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 text-blue-600 text-sm font-medium hover:bg-blue-100 transition-colors"
        title="Report a problem with this file"
      >
        <FlagIcon className="w-3.5 h-3.5" />
        Report a problem
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <FlagSolid className="w-5 h-5 text-red-500" />
                <h2 className="font-bold text-gray-900 text-lg">Report a Problem</h2>
              </div>
              <button onClick={handleClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors">
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            {done ? (
              <div className="p-10 text-center">
                <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FlagSolid className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Report submitted</h3>
                <p className="text-gray-500 mb-8 leading-relaxed">
                  We&apos;ll review <span className="font-semibold text-gray-700">{title}</span> and take action if needed.
                </p>
                <button onClick={handleClose} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold transition-colors">
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div>
                  <p className="text-sm text-gray-500 mb-4 bg-gray-50 p-3 rounded-xl border border-gray-100">
                    Reporting: <span className="font-semibold text-gray-900">{title}</span>
                  </p>

                  <label className="block text-sm font-bold text-gray-700 mb-3 ml-1">What&apos;s the problem? *</label>
                  <div className="space-y-2">
                    {REASONS.map(r => (
                      <label key={r.value} className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors has-[:checked]:border-blue-500 has-[:checked]:bg-blue-50/50">
                        <input
                          type="radio"
                          name="reason"
                          value={r.value}
                          checked={reason === r.value}
                          onChange={() => setReason(r.value)}
                          className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                        />
                        <span className="text-sm font-medium text-gray-700">{r.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">
                    Additional details <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <textarea
                    value={description}
                    onChange={e => setDesc(e.target.value)}
                    rows={3}
                    maxLength={500}
                    placeholder="Describe the issue in more detail..."
                    className="w-full border border-gray-200 rounded-xl p-4 text-sm text-gray-700 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">
                    Your email <span className="text-gray-400 font-normal text-xs">(optional — for follow-up)</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full border border-gray-200 rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={handleClose} className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all">
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || !reason}
                    className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-600/20 transition-all"
                  >
                    {submitting ? "Submitting..." : "Submit Report"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
