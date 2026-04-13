"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowUpTrayIcon, DocumentIcon, PhotoIcon, XMarkIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

interface Subject {
  _id: string;
  name: string;
  slug: string;
}
interface Category {
  _id: string;
  name: string;
  slug: string;
}

export default function NewResourcePage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const ogRef = useRef<HTMLInputElement>(null);

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState({
    title: "",
    subject: "",
    medium: "sinhala",
    category: "",
    description: "",
    seoTitle: "",
    seoDescription: "",
    tags: "",
    year: "",
    term: "",
    isActive: true,
    isFeatured: false,
    slug: "",
  });
  const [uploadedFile, setUploadedFile] = useState<{ url: string; key: string; name: string; size: number } | null>(null);
  const [uploadedOg, setUploadedOg] = useState<{ url: string; key: string } | null>(null);
  const [uploading, setUploading] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/subjects").then(r => r.json()).then(({ subjects }) => setSubjects(subjects || []));
    fetch("/api/categories").then(r => r.json()).then(({ categories }) => setCategories(categories || []));
  }, []);

  const uploadFile = async (file: File, folder: string, setter: (v: { url: string; key: string; name: string; size: number } | { url: string; key: string }) => void, type: string) => {
    setUploading(type);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setter(data);
      toast.success(`${type} uploaded`);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(null);
    }
  };

  const handleSave = async () => {
    if (!form.title || !form.subject || !form.category || !uploadedFile) {
      toast.error("Title, subject, category and file are required.");
      return;
    }
    setSaving(true);
    try {
      const tags = form.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      const body = {
        ...form,
        fileUrl: uploadedFile.url,
        fileKey: uploadedFile.key,
        fileSize: uploadedFile.size,
        fileType: uploadedFile.name.split(".").pop() || "pdf",
        ogImage: uploadedOg?.url,
        thumbnail: uploadedOg?.url,
        tags,
        year: form.year ? parseInt(form.year) : undefined,
        term: form.term || undefined,
      };
      const res = await fetch("/api/resources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success("Resource created!");
      router.push("/admin/resources");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Upload Resource</h1>
        <p className="text-sm text-gray-500 mt-1">Add a new study material to Commerce.lk</p>
      </div>

      <div className="space-y-6">
        {/* Basic Info */}
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-gray-900 border-b border-gray-100 pb-3">Basic Information</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Title *</label>
            <input 
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
              value={form.title} 
              onChange={e => setForm({ ...form, title: e.target.value })} 
              placeholder="e.g. Accounting Past Paper 2023" 
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Slug</label>
              <input 
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                value={form.slug} 
                onChange={e => setForm({ ...form, slug: e.target.value })} 
                placeholder="auto-generated from title" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Medium *</label>
              <select 
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" 
                value={form.medium} 
                onChange={e => setForm({ ...form, medium: e.target.value })}
              >
                <option value="sinhala">Sinhala</option>
                <option value="tamil">Tamil</option>
                <option value="english">English</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Subject *</label>
              <select 
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" 
                value={form.subject} 
                onChange={e => setForm({ ...form, subject: e.target.value })}
              >
                <option value="">-- Select Subject --</option>
                {subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Category *</label>
              <select 
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" 
                value={form.category} 
                onChange={e => setForm({ ...form, category: e.target.value })}
              >
                <option value="">-- Select Category --</option>
                {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Year</label>
              <input 
                type="number" 
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                value={form.year} 
                onChange={e => setForm({ ...form, year: e.target.value })} 
                placeholder="e.g. 2023" 
                min={2000} 
                max={2030} 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Term</label>
              <select 
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" 
                value={form.term} 
                onChange={e => setForm({ ...form, term: e.target.value })}
              >
                <option value="">-- No Term --</option>
                <option value="1st">1st Term</option>
                <option value="2nd">2nd Term</option>
                <option value="3rd">3rd Term</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
            <textarea 
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" 
              rows={4} 
              value={form.description} 
              onChange={e => setForm({ ...form, description: e.target.value })} 
              placeholder="Provide a brief description of the resource..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Tags (comma-separated)</label>
            <input 
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
              value={form.tags} 
              onChange={e => setForm({ ...form, tags: e.target.value })} 
              placeholder="accounting, 2023, past paper" 
            />
          </div>
          <div className="flex space-x-6">
            <label className="flex items-center space-x-2 cursor-pointer group">
              <input type="checkbox" checked={form.isActive} onChange={e => setForm({ ...form, isActive: e.target.checked })} className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
              <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">Active</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer group">
              <input type="checkbox" checked={form.isFeatured} onChange={e => setForm({ ...form, isFeatured: e.target.checked })} className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
              <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">Featured</span>
            </label>
          </div>
        </div>

        {/* File Upload */}
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-gray-900 border-b border-gray-100 pb-3">Resource File *</h2>
          <input ref={fileRef} type="file" accept=".pdf,.doc,.docx,.ppt,.pptx,.zip" className="hidden"
            onChange={e => { const f = e.target.files?.[0]; if (f) uploadFile(f, "resources", setUploadedFile as (v: { url: string; key: string } | { url: string; key: string; name: string; size: number }) => void, "File"); }} />
          {uploadedFile ? (
            <div className="flex items-center space-x-3 p-3 bg-green-50 border border-green-200 rounded-lg">
              <DocumentIcon className="w-8 h-8 text-green-500" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{uploadedFile.name}</p>
                <p className="text-xs text-gray-500">{(uploadedFile.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
              <button onClick={() => setUploadedFile(null)} className="text-gray-400 hover:text-red-500">
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading === "File"}
              className="w-full border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 hover:bg-blue-50 transition-colors"
            >
              <ArrowUpTrayIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-600">
                {uploading === "File" ? "Uploading..." : "Click to upload PDF, Word, PPT, or ZIP"}
              </p>
              <p className="text-xs text-gray-400 mt-1">Max file size: 50MB</p>
            </button>
          )}
        </div>

        {/* OG Image / Thumbnail */}
        <div className="card p-6 space-y-3">
          <div className="border-b border-gray-100 pb-3 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">OG Image / Thumbnail</h2>
            <span className="text-xs text-gray-400">Used for SEO, social sharing &amp; resource preview</span>
          </div>
          <input
            ref={ogRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={e => {
              const f = e.target.files?.[0];
              if (f) uploadFile(f, "images", setUploadedOg as (v: { url: string; key: string } | { url: string; key: string; name: string; size: number }) => void, "Image");
            }}
          />
          {uploadedOg ? (
            <div className="relative w-full rounded-xl overflow-hidden bg-gray-100 border border-gray-200" style={{ aspectRatio: "1200/630" }}>
              <img src={uploadedOg.url} alt="OG / Thumbnail" className="w-full h-full object-cover" />
              <button
                onClick={() => setUploadedOg(null)}
                className="absolute top-2 right-2 bg-white rounded-full p-1.5 shadow-md hover:bg-red-50 transition-colors"
              >
                <XMarkIcon className="w-4 h-4 text-red-500" />
              </button>
              <div className="absolute bottom-0 left-0 right-0 bg-black/40 text-white text-xs text-center py-1">
                1200 × 630 — OG Image &amp; Thumbnail
              </div>
            </div>
          ) : (
            <button
              onClick={() => ogRef.current?.click()}
              disabled={uploading === "Image"}
              className="w-full border-2 border-dashed border-gray-300 rounded-xl text-center hover:border-blue-400 hover:bg-blue-50 transition-colors"
              style={{ aspectRatio: "1200/630" }}
            >
              <div className="flex flex-col items-center justify-center h-full py-6">
                <PhotoIcon className="w-10 h-10 text-gray-300 mb-2" />
                <p className="text-sm font-medium text-gray-500">
                  {uploading === "Image" ? "Uploading..." : "Click to upload image"}
                </p>
                <p className="text-xs text-gray-400 mt-1">Recommended: 1200 × 630 px · JPG, PNG, WebP</p>
                <p className="text-xs text-gray-400">Used as both the OG Image and Thumbnail</p>
              </div>
            </button>
          )}
        </div>

        {/* SEO */}
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-gray-900 border-b border-gray-100 pb-3">SEO Settings</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">SEO Title</label>
            <input 
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
              value={form.seoTitle} 
              onChange={e => setForm({ ...form, seoTitle: e.target.value })} 
              placeholder="Leave blank for auto-generated" 
            />
            <p className="text-[10px] font-medium text-gray-400 mt-1 uppercase tracking-wider">{form.seoTitle.length}/60 characters</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">SEO Description</label>
            <textarea 
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" 
              rows={4} 
              value={form.seoDescription} 
              onChange={e => setForm({ ...form, seoDescription: e.target.value })} 
              placeholder="Leave blank for auto-generated" 
            />
            <p className="text-[10px] font-medium text-gray-400 mt-1 uppercase tracking-wider">{form.seoDescription.length}/160 characters</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex space-x-3">
          <button onClick={() => router.back()} className="btn-ghost border border-gray-200 px-6 font-bold rounded-xl transition-all">Cancel</button>
          <button onClick={handleSave} disabled={saving || !uploadedFile} className="btn-primary flex-1 font-bold rounded-xl shadow-lg shadow-blue-600/20 transition-all">
            {saving ? "Saving..." : "Publish Resource"}
          </button>
        </div>
      </div>
    </div>
  );
}
