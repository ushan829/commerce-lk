"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import toast from "react-hot-toast";
import {
  PlusIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  InboxIcon,
} from "@heroicons/react/24/outline";

const SUBJECTS = [
  "Accounting", "Business Studies", "Economics",
  "Business Mathematics", "Business Statistics", "Information Technology",
  "General English", "Common General Test",
];

const CATEGORIES = [
  "Past Papers", "Model Papers", "Short Notes",
  "Marking Schemes", "1st Term Test Papers", "2nd Term Test Papers",
  "3rd Term Test Papers",
];

interface ResourceRequest {
  _id: string;
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
  pending: { label: "Pending", icon: ClockIcon, cls: "bg-yellow-50 text-yellow-700 border-yellow-100" },
  fulfilled: { label: "Fulfilled", icon: CheckCircleIcon, cls: "bg-green-50 text-green-700 border-green-100" },
  rejected: { label: "Rejected", icon: XCircleIcon, cls: "bg-red-50 text-red-700 border-red-100" },
};

export default function RequestsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [requests, setRequests] = useState<ResourceRequest[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    subject: "", medium: "", category: "", title: "", year: "", notes: "",
  });

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login?callbackUrl=/requests");
  }, [status, router]);

  useEffect(() => {
    if (session?.user) fetchRequests();
  }, [session]);

  async function fetchRequests() {
    try {
      const res = await fetch("/api/requests");
      const data = await res.json();
      if (data.requests) setRequests(data.requests);
    } finally {
      setLoadingList(false);
    }
  }

  const set = (k: string) => (e: any) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          year: form.year ? Number(form.year) : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success("Request submitted!");
      setRequests((prev) => [data.request, ...prev]);
      setForm({ subject: "", medium: "", category: "", title: "", year: "", notes: "" });
      setShowForm(false);
    } catch (err: any) {
      toast.error(err.message || "Submission failed");
    } finally {
      setSubmitting(false);
    }
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (status === "unauthenticated") return null;

  return (
    <>
      <Header />
      {/* Page hero section */}
      <section className="bg-gray-50 border-b border-gray-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Resource Requests
          </h1>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            Can't find what you need? Request a resource and our team will upload it.
          </p>
        </div>
      </section>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-12">
             <h2 className="text-2xl font-bold text-gray-900">My Requests</h2>
             <button
              onClick={() => setShowForm(!showForm)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2"
            >
              <PlusIcon className="w-5 h-5" />
              New Request
            </button>
          </div>

          {showForm && (
            <div className="bg-white border border-gray-100 rounded-3xl p-8 mb-12 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 mb-8">Submit a Request</h3>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-400 block mb-2">Subject</label>
                    <select required className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" value={form.subject} onChange={set("subject")}>
                      <option value="">Select subject</option>
                      {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-400 block mb-2">Medium</label>
                    <select required className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" value={form.medium} onChange={set("medium")}>
                      <option value="">Select medium</option>
                      <option value="sinhala">Sinhala</option>
                      <option value="tamil">Tamil</option>
                      <option value="english">English</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-400 block mb-2">Category</label>
                    <select required className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" value={form.category} onChange={set("category")}>
                      <option value="">Select category</option>
                      {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-400 block mb-2">Year (optional)</label>
                    <input type="number" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" placeholder="e.g. 2023" value={form.year} onChange={set("year")} />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-400 block mb-2">Resource Title</label>
                  <input type="text" required className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" placeholder="e.g. Accounting Model Paper 2023" value={form.title} onChange={set("title")} />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-400 block mb-2">Notes</label>
                  <textarea className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none" rows={3} placeholder="Add any details..." value={form.notes} onChange={set("notes")} />
                </div>
                <div className="flex gap-4">
                  <button type="submit" disabled={submitting} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold transition-all disabled:opacity-50">
                    {submitting ? "Submitting..." : "Submit Request"}
                  </button>
                  <button type="button" onClick={() => setShowForm(false)} className="border-2 border-gray-200 text-gray-600 hover:bg-gray-50 px-8 py-3 rounded-xl font-bold transition-all">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="space-y-4">
            {loadingList ? (
              <div className="py-20 text-center text-gray-400">Loading requests...</div>
            ) : requests.length === 0 ? (
              <div className="bg-gray-50 border border-gray-100 rounded-3xl p-12 text-center text-gray-400">
                <InboxIcon className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p className="text-lg">No requests submitted yet.</p>
              </div>
            ) : (
              requests.map((req) => {
                const cfg = STATUS_CONFIG[req.status];
                const Icon = cfg.icon;
                return (
                  <div key={req._id} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex items-center justify-between gap-6 hover:shadow-md transition-shadow">
                    <div className="flex-1">
                      <div className="flex flex-wrap gap-2 mb-2">
                         <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-600 text-[10px] font-bold uppercase tracking-wider">{req.subject}</span>
                         <span className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 text-[10px] font-bold uppercase tracking-wider">{req.category}</span>
                      </div>
                      <h4 className="text-lg font-bold text-gray-900 mb-1">{req.title}</h4>
                      <p className="text-sm text-gray-500">Requested on {new Date(req.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-full border font-bold text-xs ${cfg.cls}`}>
                      <Icon className="w-4 h-4" />
                      {cfg.label}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
