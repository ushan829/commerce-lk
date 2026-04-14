"use client";

import { useState, useEffect, useCallback } from "react";
import { 
  PaperAirplaneIcon, 
  ClockIcon, 
  EnvelopeIcon, 
  CheckCircleIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  UsersIcon
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

interface Broadcast {
  _id: string;
  subject: string;
  message: string;
  recipientType: 'all' | 'verified' | 'unverified';
  sentCount: number;
  failedCount: number;
  totalRecipients: number;
  status: 'sending' | 'completed' | 'failed';
  createdAt: string;
  sentBy: { name: string };
}

export default function AdminBroadcastPage() {
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [recipientCount, setRecipientCount] = useState<number | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    subject: "",
    message: "",
    recipientType: "all" as "all" | "verified" | "unverified",
  });

  const fetchBroadcasts = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/broadcast");
      const data = await res.json();
      if (res.ok) {
        setBroadcasts(data.broadcasts);
      }
    } catch (error) {
      toast.error("Failed to fetch history");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchRecipientCount = useCallback(async (type: string) => {
    try {
      const res = await fetch(`/api/admin/users?count=1&type=${type}`);
      const data = await res.json();
      if (res.ok) {
        setRecipientCount(data.count);
      }
    } catch {}
  }, []);

  useEffect(() => {
    fetchBroadcasts();
    fetchRecipientCount(formData.recipientType);
  }, [fetchBroadcasts, fetchRecipientCount, formData.recipientType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.subject || !formData.message) return toast.error("Please fill all fields");

    const confirmed = confirm(
      `You are about to send an email to ${recipientCount} users. This cannot be undone. Are you sure?`
    );
    if (!confirmed) return;

    setSending(true);
    try {
      const res = await fetch("/api/admin/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(`Broadcast complete! Sent: ${data.sentCount}, Failed: ${data.failedCount}`);
        setFormData({ subject: "", message: "", recipientType: "all" });
        fetchBroadcasts();
      } else {
        toast.error(data.error || "Failed to send broadcast");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setSending(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-LK", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-8 pb-20">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Email Broadcast</h1>
        <p className="text-gray-500 mt-1">Send customized emails to your registered users</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Compose Form */}
        <div className="xl:col-span-2">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <EnvelopeIcon className="w-5 h-5 text-blue-600" />
                Compose Broadcast Email
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center justify-between">
                  <span>Recipient Group</span>
                  <span className="text-blue-600 flex items-center gap-1 font-medium">
                    <UsersIcon className="w-4 h-4" />
                    ~{recipientCount ?? "..."} recipients
                  </span>
                </label>
                <select
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                  value={formData.recipientType}
                  onChange={(e) => setFormData({ ...formData, recipientType: e.target.value as any })}
                >
                  <option value="all">All Active Users</option>
                  <option value="verified">Verified Users Only</option>
                  <option value="unverified">Unverified Users Only</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Subject Line</label>
                <input
                  type="text"
                  required
                  placeholder="E.g. Important Update Regarding New Past Papers"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center justify-between">
                  <span>Message Content</span>
                  <button
                    type="button"
                    onClick={() => setShowPreview(!showPreview)}
                    className="text-xs text-blue-600 hover:underline font-bold flex items-center gap-1"
                  >
                    <EyeIcon className="w-3 h-3" />
                    {showPreview ? "Hide Preview" : "Show Preview"}
                  </button>
                </label>
                <textarea
                  required
                  rows={12}
                  placeholder="Type your message here... Line breaks will be preserved. HTML tags are not allowed."
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all resize-none font-mono"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                />
              </div>

              {showPreview && (
                <div className="p-6 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
                  <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
                    <EyeIcon className="w-4 h-4" />
                    Live Email Preview
                  </div>
                  <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm max-w-[500px] mx-auto">
                    <div className="bg-blue-600 p-4">
                      <div className="bg-white inline-block px-3 py-1 rounded-lg text-xs font-black">
                        Commerce<span className="text-blue-600">.lk</span>
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="font-bold text-gray-900 mb-4">{formData.subject || "Subject will appear here"}</h3>
                      <p className="text-sm text-gray-600 whitespace-pre-wrap leading-relaxed">
                        {formData.message || "Message content will appear here..."}
                      </p>
                    </div>
                    <div className="p-4 bg-gray-50 border-t border-gray-100 text-center">
                      <p className="text-[10px] text-gray-400">© 2026 Commerce.lk · Sri Lanka's #1 A/L Commerce Platform</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-4 flex gap-3">
                <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 shrink-0" />
                <p className="text-xs text-yellow-700 leading-relaxed">
                  <strong>Warning:</strong> You are about to send this email to approximately <strong>{recipientCount} users</strong>. 
                  This process is irreversible. Please double-check your content and recipient group before sending.
                </p>
              </div>

              <button
                type="submit"
                disabled={sending || !formData.subject || !formData.message}
                className="w-full btn-primary py-4 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sending ? (
                  <>
                    <ClockIcon className="w-5 h-5 animate-spin" />
                    Sending Emails... Please Wait
                  </>
                ) : (
                  <>
                    <PaperAirplaneIcon className="w-5 h-5" />
                    Send Broadcast Now
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Info sidebar */}
        <div className="space-y-6">
          <div className="bg-blue-600 rounded-2xl p-6 text-white shadow-lg shadow-blue-200">
            <h3 className="font-bold mb-2 flex items-center gap-2">
              <InformationCircleIcon className="w-5 h-5" />
              Email Best Practices
            </h3>
            <ul className="text-sm space-y-3 text-blue-100">
              <li className="flex gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-300 mt-1.5 shrink-0" />
                Keep your subject lines short and engaging.
              </li>
              <li className="flex gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-300 mt-1.5 shrink-0" />
                Use a professional and friendly tone.
              </li>
              <li className="flex gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-300 mt-1.5 shrink-0" />
                Double check for any spelling errors.
              </li>
              <li className="flex gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-300 mt-1.5 shrink-0" />
                Avoid using all caps or excessive exclamation marks.
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* History Section */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <ClockIcon className="w-5 h-5 text-gray-400" />
            Previous Broadcasts
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Subject</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Recipients</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Sent / Failed</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Status</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">Loading...</td></tr>
              ) : broadcasts.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-500 italic">No broadcasts sent yet.</td></tr>
              ) : (
                broadcasts.map((b) => (
                  <tr key={b._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="max-w-xs">
                        <p className="text-sm font-bold text-gray-900 truncate" title={b.subject}>{b.subject}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">By {b.sentBy?.name || "Admin"}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                        b.recipientType === 'verified' ? 'bg-green-50 text-green-600' :
                        b.recipientType === 'unverified' ? 'bg-yellow-50 text-yellow-600' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {b.recipientType}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-green-600">{b.sentCount}</span>
                        {b.failedCount > 0 && (
                          <span className="text-sm font-bold text-red-600">/ {b.failedCount} failed</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                        b.status === 'completed' ? 'bg-green-100 text-green-700' :
                        b.status === 'sending' ? 'bg-blue-100 text-blue-700 animate-pulse' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {b.status === 'completed' && <CheckCircleIcon className="w-3 h-3" />}
                        {b.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-500 whitespace-nowrap">
                      {formatDate(b.createdAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function InformationCircleIcon(props: any) {
  return (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
    </svg>
  )
}
