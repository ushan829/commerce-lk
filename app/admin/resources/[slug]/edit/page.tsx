"use client";

import { useState, useEffect, use, useRef } from "react";
import { useRouter } from "next/navigation";
import { PhotoIcon, XMarkIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

interface Subject { _id: string; name: string; slug: string; }
interface Category { _id: string; name: string; slug: string; }

export default function EditResourcePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const router = useRouter();
  const ogRef = useRef<HTMLInputElement>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState({
    title: "", description: "", seoTitle: "", seoDescription: "",
    tags: "", year: "", term: "", isActive: true, isFeatured: false,
    subject: "", medium: "sinhala", category: "",
  });
  const [currentOgImage, setCurrentOgImage] = useState<string>("");
  const [uploadedOg, setUploadedOg] = useState<{ url: string; key: string } | null>(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch(`/api/resources/${slug}`).then(r => r.json()),
      fetch("/api/subjects").then(r => r.json()),
      fetch("/api/categories").then(r => r.json()),
    ]).then(([{ resource }, { subjects }, { categories }]) => {
      setSubjects(subjects || []);
      setCategories(categories || []);
      if (resource) {
        setForm({
          title: resource.title || "",
          description: resource.description || "",
          seoTitle: resource.seoTitle || "",
          seoDescription: resource.seoDescription || "",
          tags: (resource.tags || []).join(", "),
          year: resource.year?.toString() || "",
          term: resource.term || "",
          isActive: resource.isActive ?? true,
          isFeatured: resource.isFeatured ?? false,
          subject: resource.subject?._id || "",
          medium: resource.medium || "sinhala",
          category: resource.category?._id || "",
        });
        setCurrentOgImage(resource.ogImage || resource.thumbnail || "");
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [slug]);

  const uploadImage = async (file: File) => {
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "images");
    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setUploadedOg(data);
      toast.success("Image uploaded");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const tags = form.tags.split(",").map(t => t.trim()).filter(Boolean);
      const newImage = uploadedOg?.url;
      const res = await fetch(`/api/resources/${slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          tags,
          year: form.year ? parseInt(form.year) : undefined,
          term: form.term || undefined,
          ...(newImage ? { ogImage: newImage, thumbnail: newImage } : {}),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success("Resource updated!");
      router.push("/admin/resources");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-400">Loading...</div>;

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Edit Resource</h1>
        <p className="text-sm text-gray-500 mt-1 font-mono">{slug}</p>
      </div>
      <div className="card p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Title</label>
          <input className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Subject</label>
            <select className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })}>
              <option value="">-- Select --</option>
              {subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Category</label>
            <select className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
              <option value="">-- Select --</option>
              {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Medium</label>
            <select className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" value={form.medium} onChange={e => setForm({ ...form, medium: e.target.value })}>
              <option value="sinhala">Sinhala</option>
              <option value="tamil">Tamil</option>
              <option value="english">English</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Year</label>
            <input type="number" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" value={form.year} onChange={e => setForm({ ...form, year: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Term</label>
            <select className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" value={form.term} onChange={e => setForm({ ...form, term: e.target.value })}>
              <option value="">-- No Term --</option>
              <option value="1st">1st Term</option>
              <option value="2nd">2nd Term</option>
              <option value="3rd">3rd Term</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
          <textarea className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" rows={4} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Tags (comma-separated)</label>
          <input className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} />
        </div>
        {/* OG Image / Thumbnail */}
        <div className="border-t border-gray-100 pt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">OG Image / Thumbnail (1200 × 630)</label>
          <p className="text-xs text-gray-400 mb-3">Used for SEO, social sharing &amp; resource preview. Leave unchanged to keep the current image.</p>
          <input
            ref={ogRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={e => { const f = e.target.files?.[0]; if (f) uploadImage(f); }}
          />
          {uploadedOg ? (
            <div className="relative w-full rounded-xl overflow-hidden bg-gray-100 border border-gray-200" style={{ aspectRatio: "1200/630" }}>
              <img src={uploadedOg.url} alt="OG / Thumbnail" className="w-full h-full object-cover" />
              <button onClick={() => setUploadedOg(null)} className="absolute top-2 right-2 bg-white rounded-full p-1.5 shadow-md hover:bg-red-50 transition-colors">
                <XMarkIcon className="w-4 h-4 text-red-500" />
              </button>
              <div className="absolute bottom-0 left-0 right-0 bg-black/40 text-white text-xs text-center py-1 font-medium">
                New image — will replace current on save
              </div>
            </div>
          ) : currentOgImage ? (
            <div className="relative w-full rounded-xl overflow-hidden bg-gray-100 border border-gray-200" style={{ aspectRatio: "1200/630" }}>
              <img src={currentOgImage} alt="Current OG" className="w-full h-full object-cover" />
              <button
                onClick={() => ogRef.current?.click()}
                className="absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/30 transition-colors group"
              >
                <span className="opacity-0 group-hover:opacity-100 bg-white text-gray-900 text-xs font-bold px-4 py-2 rounded-xl shadow-xl transition-all transform scale-95 group-hover:scale-100">
                  Replace Image
                </span>
              </button>
              <div className="absolute bottom-0 left-0 right-0 bg-black/40 text-white text-xs text-center py-1 font-medium">
                Current image · Hover to replace
              </div>
            </div>
          ) : (
            <button
              onClick={() => ogRef.current?.click()}
              disabled={uploading}
              className="w-full border-2 border-dashed border-gray-300 rounded-xl text-center hover:border-blue-400 hover:bg-blue-50 transition-all"
              style={{ aspectRatio: "1200/630" }}
            >
              <div className="flex flex-col items-center justify-center h-full py-4">
                <PhotoIcon className="w-10 h-10 text-gray-300 mb-2" />
                <p className="text-sm font-bold text-gray-500">{uploading ? "Uploading..." : "Click to upload image"}</p>
                <p className="text-xs text-gray-400 mt-1">Recommended: 1200 × 630 px</p>
              </div>
            </button>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">SEO Title</label>
          <input className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" value={form.seoTitle} onChange={e => setForm({ ...form, seoTitle: e.target.value })} placeholder="Leave blank for auto-generated" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">SEO Description</label>
          <textarea className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" rows={3} value={form.seoDescription} onChange={e => setForm({ ...form, seoDescription: e.target.value })} placeholder="Leave blank for auto-generated" />
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
        <div className="flex gap-3 pt-2">
          <button onClick={() => router.back()} className="px-6 py-2.5 border border-gray-100 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-blue-600/20 transition-all">
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
