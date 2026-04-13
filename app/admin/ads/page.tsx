"use client";

import { useState, useEffect, useRef } from "react";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ArrowUpTrayIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import Image from "next/image";

interface Ad {
  _id: string;
  title: string;
  type: string;
  position: string;
  isActive: boolean;
  clickCount: number;
  impressionCount: number;
  targetSubjects: string[];
  targetCategories: string[];
  targetMediums: string[];
  imageUrl?: string;
  imageKey?: string;
  linkUrl?: string;
  htmlContent?: string;
  nativeTitle?: string;
  nativeDescription?: string;
  nativeImage?: string;
  nativeImageKey?: string;
  startDate?: string;
  endDate?: string;
  order: number;
}

const AD_POSITIONS = [
  { value: "home-hero",         label: "Home — Hero Banner" },
  { value: "home-top",          label: "Home — Top" },
  { value: "home-bottom",       label: "Home — Bottom" },
  { value: "subject-top",       label: "Subject Page — Top" },
  { value: "subject-bottom",    label: "Subject Page — Bottom" },
  { value: "category-top",      label: "Category Page — Top" },
  { value: "category-sidebar",  label: "Category Page — Sidebar" },
  { value: "resource-top",      label: "Resource Page — Top" },
  { value: "resource-sidebar",  label: "Resource Page — Sidebar" },
  { value: "resource-bottom",   label: "Resource Page — Bottom" },
];

function getImageSizeHint(position: string, type: string): string {
  if (type === "native") {
    const nativeSizes: Record<string, string> = {
      "home-top":         "400 × 300 PX",
      "home-bottom":      "400 × 300 PX",
      "subject-top":      "400 × 300 PX",
      "subject-bottom":   "400 × 300 PX",
      "category-top":     "400 × 300 PX",
      "category-sidebar": "300 × 250 PX (MEDIUM RECTANGLE)",
      "resource-top":     "400 × 300 PX",
      "resource-sidebar": "300 × 250 PX (MEDIUM RECTANGLE)",
      "resource-bottom":  "400 × 300 PX",
    };
    return nativeSizes[position] || "300 × 250 PX (MEDIUM RECTANGLE)";
  }
  const bannerSizes: Record<string, string> = {
    "home-top":         "970 × 90 PX (LEADERBOARD)",
    "home-bottom":      "970 × 90 PX (LEADERBOARD)",
    "home-hero":        "970 × 250 PX (BILLBOARD)",
    "subject-top":      "728 × 90 PX (LEADERBOARD)",
    "subject-bottom":   "728 × 90 PX (LEADERBOARD)",
    "category-top":     "728 × 90 PX (LEADERBOARD)",
    "category-sidebar": "300 × 250 PX (MEDIUM RECTANGLE)",
    "resource-top":     "728 × 90 PX (LEADERBOARD)",
    "resource-sidebar": "300 × 600 PX (HALF PAGE)",
    "resource-bottom":  "728 × 90 PX (LEADERBOARD)",
  };
  return bannerSizes[position] || "970 × 250 PX";
}

const SUBJECTS = [
  "accounting", "business-studies", "economics", "business-statistics", "ict",
  "general-english", "common-general-test", "git",
];
const MEDIUMS = ["sinhala", "tamil", "english"];

const emptyForm = {
  title: "",
  type: "banner",
  position: "home-hero",
  imageUrl: "",
  imageKey: "",
  linkUrl: "",
  altText: "",
  htmlContent: "",
  nativeTitle: "",
  nativeDescription: "",
  nativeImage: "",
  nativeImageKey: "",
  targetSubjects: [] as string[],
  targetCategories: [] as string[],
  targetMediums: [] as string[],
  isActive: true,
  startDate: "",
  endDate: "",
  order: 0,
};

export default function AdsAdmin() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Ad | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  // Upload state: track per-field uploads
  const [uploadingMain, setUploadingMain] = useState(false);
  const [uploadingNative, setUploadingNative] = useState(false);
  const mainFileRef = useRef<HTMLInputElement>(null);
  const nativeFileRef = useRef<HTMLInputElement>(null);

  // Keys uploaded in this session that should be cleaned up on cancel
  const pendingCleanupKeys = useRef<string[]>([]);

  const fetchAds = () => {
    setLoading(true);
    fetch("/api/ads?admin=true")
      .then((r) => r.json())
      .then(({ ads }) => { setAds(ads || []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(fetchAds, []);

  const openNew = () => {
    setEditing(null);
    setForm(emptyForm);
    pendingCleanupKeys.current = [];
    setShowModal(true);
  };

  const openEdit = (ad: Ad) => {
    setEditing(ad);
    setForm({
      title:            ad.title,
      type:             ad.type,
      position:         ad.position,
      imageUrl:         ad.imageUrl || "",
      imageKey:         ad.imageKey || "",
      linkUrl:          ad.linkUrl || "",
      altText:          "",
      htmlContent:      ad.htmlContent || "",
      nativeTitle:      ad.nativeTitle || "",
      nativeDescription: ad.nativeDescription || "",
      nativeImage:      ad.nativeImage || "",
      nativeImageKey:   ad.nativeImageKey || "",
      targetSubjects:   ad.targetSubjects || [],
      targetCategories: ad.targetCategories || [],
      targetMediums:    ad.targetMediums || [],
      isActive:         ad.isActive,
      startDate:        ad.startDate ? ad.startDate.slice(0, 10) : "",
      endDate:          ad.endDate   ? ad.endDate.slice(0, 10)   : "",
      order:            ad.order,
    });
    pendingCleanupKeys.current = [];
    setShowModal(true);
  };

  // Upload a file to /api/ads/upload and return {url, key}
  async function uploadFile(file: File): Promise<{ url: string; key: string }> {
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/ads/upload", { method: "POST", body: fd });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Upload failed");
    return data;
  }

  async function handleMainUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingMain(true);
    try {
      const { url, key } = await uploadFile(file);
      // If there was a previously uploaded (not saved) key, queue it for cleanup
      if (form.imageKey && !editing?.imageKey) {
        pendingCleanupKeys.current.push(form.imageKey);
      }
      setForm((f) => ({ ...f, imageUrl: url, imageKey: key }));
      toast.success("Image uploaded");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploadingMain(false);
      if (mainFileRef.current) mainFileRef.current.value = "";
    }
  }

  async function handleNativeUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingNative(true);
    try {
      const { url, key } = await uploadFile(file);
      if (form.nativeImageKey && !editing?.nativeImageKey) {
        pendingCleanupKeys.current.push(form.nativeImageKey);
      }
      setForm((f) => ({ ...f, nativeImage: url, nativeImageKey: key }));
      toast.success("Image uploaded");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploadingNative(false);
      if (nativeFileRef.current) nativeFileRef.current.value = "";
    }
  }

  function clearMainImage() {
    if (form.imageKey && !editing?.imageKey) {
      pendingCleanupKeys.current.push(form.imageKey);
    }
    setForm((f) => ({ ...f, imageUrl: "", imageKey: "" }));
  }

  function clearNativeImage() {
    if (form.nativeImageKey && !editing?.nativeImageKey) {
      pendingCleanupKeys.current.push(form.nativeImageKey);
    }
    setForm((f) => ({ ...f, nativeImage: "", nativeImageKey: "" }));
  }

  async function cleanupPendingKeys() {
    const keys = [...pendingCleanupKeys.current];
    pendingCleanupKeys.current = [];
    await Promise.all(
      keys.map((key) =>
        fetch("/api/ads/upload", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key }),
        }).catch(() => {})
      )
    );
  }

  const handleCancel = async () => {
    setShowModal(false);
    await cleanupPendingKeys();
  };

  const handleSave = async () => {
    if (!form.title) return toast.error("Title is required");
    setSaving(true);
    try {
      const url    = editing ? `/api/ads/${editing._id}` : "/api/ads";
      const method = editing ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      // Clean up any keys that were queued (replaced during this edit session)
      await cleanupPendingKeys();
      toast.success(editing ? "Ad updated" : "Ad created");
      setShowModal(false);
      fetchAds();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this ad? Uploaded images will also be removed.")) return;
    await fetch(`/api/ads/${id}`, { method: "DELETE" });
    toast.success("Deleted");
    fetchAds();
  };

  const toggleSubject = (s: string) =>
    setForm((f) => ({
      ...f,
      targetSubjects: f.targetSubjects.includes(s)
        ? f.targetSubjects.filter((x) => x !== s)
        : [...f.targetSubjects, s],
    }));

  const toggleMedium = (m: string) =>
    setForm((f) => ({
      ...f,
      targetMediums: f.targetMediums.includes(m)
        ? f.targetMediums.filter((x) => x !== m)
        : [...f.targetMediums, m],
    }));

  const imageSizeHint = getImageSizeHint(form.position, form.type);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Advertisements</h1>
          <p className="text-sm text-gray-500 mt-1">Manage banner, native, and sidebar ads</p>
        </div>
        <button onClick={openNew} className="btn-primary py-2 px-4 text-sm font-bold flex items-center gap-1 shadow-md shadow-blue-600/10 transition-all">
          <PlusIcon className="w-4 h-4" />
          New Ad
        </button>
      </div>

      <div className="card overflow-x-auto">
        {loading ? (
          <div className="p-16 text-center text-gray-400">
            <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-4" />
            Loading advertisements...
          </div>
        ) : (
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="border-b border-gray-100 text-left">
                <th className="px-5 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Ad</th>
                <th className="px-5 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Type</th>
                <th className="px-5 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Position</th>
                <th className="px-5 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Performance</th>
                <th className="px-5 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
                <th className="px-5 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {ads.map((ad) => (
                <tr key={ad._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4">
                    <p className="font-bold text-gray-900 text-sm">{ad.title}</p>
                    {ad.targetSubjects?.length > 0 && (
                      <p className="text-[10px] text-gray-400 mt-0.5 font-medium uppercase tracking-tighter">
                        Target: {ad.targetSubjects.join(", ").replace(/-/g, " ")}
                      </p>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <span className={`badge text-[10px] uppercase font-bold tracking-wider capitalize ${
                      ad.type === "banner"  ? "bg-blue-100 text-blue-700" :
                      ad.type === "native"  ? "bg-orange-100 text-orange-700" :
                                              "bg-purple-100 text-purple-700"
                    }`}>
                      {ad.type}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-xs font-medium text-gray-600">
                    {AD_POSITIONS.find((p) => p.value === ad.position)?.label || ad.position}
                  </td>
                  <td className="px-5 py-4 text-xs text-gray-500">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-bold text-gray-700">{ad.impressionCount} <span className="font-normal text-gray-400">imps</span></span>
                      <span className="font-bold text-gray-700">{ad.clickCount} <span className="font-normal text-gray-400">clicks</span></span>
                      {ad.impressionCount > 0 && (
                        <span className="text-[10px] font-bold text-blue-600 uppercase">
                          CTR: {((ad.clickCount / ad.impressionCount) * 100).toFixed(1)}%
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`badge text-[10px] uppercase font-bold tracking-wider ${ad.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                      {ad.isActive ? "Active" : "Paused"}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center space-x-2">
                      <button onClick={() => openEdit(ad)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(ad._id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {ads.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-gray-400">No ads yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm transition-all">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">{editing ? "Edit Ad" : "Create Ad"}</h2>
              <button onClick={handleCancel} className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors">
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 overflow-y-auto">
              {/* Ad Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Ad Title (Internal) *
                </label>
                <input 
                  type="text" 
                  placeholder="e.g. Summer Tuition Banner"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </div>

              {/* Type + Position - side by side */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Type *
                  </label>
                  <select 
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-white"
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                  >
                    <option value="banner">Banner Ad</option>
                    <option value="native">Native Ad</option>
                    <option value="sidebar">Sidebar Ad</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Position *
                  </label>
                  <select 
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-white"
                    value={form.position}
                    onChange={(e) => setForm({ ...form, position: e.target.value })}
                  >
                    {AD_POSITIONS.map((p) => (
                      <option key={p.value} value={p.value}>{p.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Image / Sidebar Ad Settings section */}
              {(form.type === "banner" || form.type === "sidebar") && (
                <div className="bg-gray-50 rounded-2xl border border-gray-100 p-5 space-y-4">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    Image Ad Settings
                  </p>
                  
                  {/* Ad Image */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Ad Image
                      <span className="text-xs text-blue-600 font-normal ml-2">
                        {imageSizeHint}
                      </span>
                    </label>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        placeholder="Paste image URL..."
                        className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
                        value={form.imageUrl}
                        onChange={(e) => setForm({ ...form, imageUrl: e.target.value, imageKey: "" })}
                      />
                      <button 
                        type="button"
                        onClick={() => mainFileRef.current?.click()}
                        disabled={uploadingMain}
                        className="px-6 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl text-sm font-bold text-gray-700 transition-all shadow-sm whitespace-nowrap disabled:opacity-50"
                      >
                        {uploadingMain ? "..." : "Upload"}
                      </button>
                      <input ref={mainFileRef} type="file" accept="image/*" className="hidden" onChange={handleMainUpload} />
                    </div>
                    {form.imageUrl && (
                      <div className="mt-3 relative inline-block">
                        <Image src={form.imageUrl} alt="Preview" width={200} height={60} className="rounded-lg border border-gray-200 object-contain max-h-20 bg-white" unoptimized />
                        <button type="button" onClick={clearMainImage} className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 shadow-md">
                          <XMarkIcon className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                    <p className="text-[10px] text-gray-400 mt-1.5 font-medium uppercase tracking-tighter">JPEG, PNG, WebP or GIF · Max 5MB</p>
                  </div>

                  {/* Link URL */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Link URL
                    </label>
                    <input 
                      type="url" 
                      placeholder="https://..."
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
                      value={form.linkUrl}
                      onChange={(e) => setForm({ ...form, linkUrl: e.target.value })}
                    />
                  </div>

                  {/* HTML/Script Code */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Or: HTML / Script Code
                      <span className="text-xs text-gray-400 font-normal ml-2 lowercase tracking-normal italic">
                        (Google AdSense, etc.)
                      </span>
                    </label>
                    <textarea 
                      rows={3} 
                      placeholder="<script>...</script> or <iframe>...</iframe>"
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-mono text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white resize-none"
                      value={form.htmlContent}
                      onChange={(e) => setForm({ ...form, htmlContent: e.target.value })}
                    />
                  </div>
                </div>
              )}

              {/* Native Ad content - added for completeness since it was in the original form */}
              {form.type === "native" && (
                <div className="bg-gray-50 rounded-2xl border border-gray-100 p-5 space-y-4">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    Native Ad Content
                  </p>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Native Title</label>
                      <input 
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
                        value={form.nativeTitle}
                        onChange={(e) => setForm({ ...form, nativeTitle: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Native Description</label>
                      <textarea 
                        rows={2}
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white resize-none"
                        value={form.nativeDescription}
                        onChange={(e) => setForm({ ...form, nativeDescription: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Native Image
                        <span className="text-xs text-blue-600 font-normal ml-2">
                          {imageSizeHint}
                        </span>
                      </label>
                      <div className="flex gap-2">
                        <input 
                          className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
                          value={form.nativeImage}
                          onChange={(e) => setForm({ ...form, nativeImage: e.target.value, nativeImageKey: "" })}
                        />
                        <button type="button" onClick={() => nativeFileRef.current?.click()} className="px-6 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold shadow-sm">Upload</button>
                        <input ref={nativeFileRef} type="file" className="hidden" onChange={handleNativeUpload} />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Link URL</label>
                      <input 
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
                        value={form.linkUrl}
                        onChange={(e) => setForm({ ...form, linkUrl: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Targeting */}
              <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-5 space-y-4">
                <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">
                  Targeting
                  <span className="font-medium normal-case ml-2 text-blue-400 italic">
                    (Leave unchecked to show everywhere)
                  </span>
                </p>
                <div>
                  <p className="text-xs font-bold text-gray-500 mb-3 uppercase tracking-wider">Target Subjects</p>
                  <div className="flex flex-wrap gap-x-4 gap-y-2">
                    {SUBJECTS.map((s) => (
                      <label key={s} className="flex items-center space-x-2 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={form.targetSubjects.includes(s)}
                          onChange={() => toggleSubject(s)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-xs font-medium text-gray-700 group-hover:text-blue-600 transition-colors capitalize">{s.replace(/-/g, " ")}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-500 mb-3 uppercase tracking-wider">Target Mediums</p>
                  <div className="flex gap-6">
                    {MEDIUMS.map((m) => (
                      <label key={m} className="flex items-center space-x-2 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={form.targetMediums.includes(m)}
                          onChange={() => toggleMedium(m)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-xs font-medium text-gray-700 group-hover:text-blue-600 transition-colors capitalize">{m}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Start + End Date */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Start Date
                  </label>
                  <input 
                    type="date"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-white"
                    value={form.startDate}
                    onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    End Date
                  </label>
                  <input 
                    type="date"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-white"
                    value={form.endDate}
                    onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                  />
                </div>
              </div>

              {/* Display Order + Active - side by side */}
              <div className="grid grid-cols-2 gap-4 items-center">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Display Order
                  </label>
                  <input 
                    type="number"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-white"
                    value={form.order}
                    onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="flex items-center gap-3 mt-6">
                  <input 
                    type="checkbox" 
                    id="active"
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    checked={form.isActive}
                    onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  />
                  <label htmlFor="active" className="text-sm font-bold text-gray-700 cursor-pointer">
                    Active Ad
                  </label>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 flex gap-3">
              <button
                onClick={handleCancel}
                className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || uploadingMain || uploadingNative}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-3 rounded-xl text-sm font-bold shadow-lg shadow-blue-600/20 transition-all"
              >
                {saving ? "Saving…" : editing ? "Update Ad" : "Create Ad"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
