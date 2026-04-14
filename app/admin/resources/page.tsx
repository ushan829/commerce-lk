"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ArrowDownTrayIcon,
  MagnifyingGlassIcon,
  DocumentDuplicateIcon,
  ArrowUpTrayIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

interface Resource {
  _id: string;
  title: string;
  slug: string;
  medium: string;
  downloadCount: number;
  isActive: boolean;
  isFeatured: boolean;
  subject: { name: string; color?: string };
  category: { name: string };
  createdAt: string;
}

export default function ResourcesAdmin() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  
  // Bulk selection state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkLoading, setIsBulkLoading] = useState(false);

  const fetchResources = (p = 1) => {
    setLoading(true);
    fetch(`/api/resources?page=${p}&limit=20`)
      .then((r) => r.json())
      .then(({ resources, pagination }) => {
        setResources(resources || []);
        setTotal(pagination?.total || 0);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchResources(page);
  }, [page]);

  const handleDuplicate = async (slug: string) => {
    try {
      const res = await fetch(`/api/admin/resources/${slug}/duplicate`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success("Resource duplicated as draft — edit it before publishing.");
      fetchResources(page);
    } catch {
      toast.error("Failed to duplicate");
    }
  };

  const handleDelete = async (slug: string) => {
    if (!confirm("Delete this resource? This will also delete the file from storage.")) return;
    try {
      const res = await fetch(`/api/resources/${slug}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed");
      toast.success("Resource deleted");
      fetchResources(page);
    } catch {
      toast.error("Failed to delete");
    }
  };

  const handleBulkAction = async (action: 'delete' | 'publish' | 'unpublish') => {
    if (selectedIds.length === 0) return;
    
    if (action === 'delete') {
      const confirmed = confirm(`Are you sure you want to DELETE ${selectedIds.length} resource(s)? This cannot be undone.`);
      if (!confirmed) return;
    }

    setIsBulkLoading(true);
    try {
      const res = await fetch('/api/admin/resources/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, resourceIds: selectedIds }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Successfully ${action}ed ${selectedIds.length} resource(s)`);
        setSelectedIds([]);
        // Force reload to ensure UI is in sync
        window.location.reload();
      } else {
        toast.error(data.error || 'Action failed. Please try again.');
      }
    } catch (error) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsBulkLoading(false);
    }
  };

  const filtered = resources.filter(
    (r) =>
      !search ||
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.subject?.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="pb-20">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Resources</h1>
          <p className="text-sm text-gray-500 mt-1">
            {total} total resources
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/admin/resources/import" className="inline-flex items-center gap-1.5 py-2 px-4 text-sm font-semibold rounded-lg border border-gray-100 bg-white text-gray-700 hover:bg-gray-50 transition-colors">
            <ArrowUpTrayIcon className="w-4 h-4" />
            Import CSV
          </Link>
          <Link href="/admin/resources/new" className="btn-primary py-2 px-4 text-sm">
            <PlusIcon className="w-4 h-4 mr-1" />
            Upload Resource
          </Link>
        </div>
      </div>

      {/* Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl mb-4 sticky top-0 z-30 shadow-sm animate-in fade-in slide-in-from-top-2 duration-200">
          <span className="text-sm font-bold text-blue-700">
            {selectedIds.length} resource{selectedIds.length > 1 ? 's' : ''} selected
          </span>
          <div className="flex gap-2 ml-auto">
            <button
              onClick={() => handleBulkAction('publish')}
              disabled={isBulkLoading}
              className="px-4 py-2 text-xs bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold transition-colors disabled:opacity-50"
            >
              Publish
            </button>
            <button
              onClick={() => handleBulkAction('unpublish')}
              disabled={isBulkLoading}
              className="px-4 py-2 text-xs bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-bold transition-colors disabled:opacity-50"
            >
              Unpublish
            </button>
            <button
              onClick={() => handleBulkAction('delete')}
              disabled={isBulkLoading}
              className="px-4 py-2 text-xs bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold transition-colors disabled:opacity-50"
            >
              Delete
            </button>
            <button
              onClick={() => setSelectedIds([])}
              className="px-4 py-2 text-xs border border-gray-300 hover:bg-white bg-white/50 text-gray-600 rounded-lg font-bold transition-colors"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="card mb-4 p-4">
        <div className="relative">
          <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            className="input pl-10"
            placeholder="Search resources..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="card overflow-x-auto">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Loading...</div>
        ) : (
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="border-b border-gray-100 text-left">
                <th className="px-5 py-3 w-12">
                  <input
                    type="checkbox"
                    checked={selectedIds.length === filtered.length && filtered.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedIds(filtered.map(r => r._id));
                      } else {
                        setSelectedIds([]);
                      }
                    }}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                </th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Title</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Subject</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Category</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Medium</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Downloads</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((r) => (
                <tr key={r._id} className={`hover:bg-gray-50 transition-colors ${selectedIds.includes(r._id) ? 'bg-blue-50' : ''}`}>
                  <td className="px-5 py-4">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(r._id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedIds(prev => [...prev, r._id]);
                        } else {
                          setSelectedIds(prev => prev.filter(id => id !== r._id));
                        }
                      }}
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-medium text-gray-900 max-w-[280px] truncate">{r.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{r.slug}</p>
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-600">{r.subject?.name}</td>
                  <td className="px-5 py-4 text-sm text-gray-600">{r.category?.name}</td>
                  <td className="px-5 py-4">
                    <span className="badge bg-gray-100 text-gray-600 capitalize">{r.medium}</span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="flex items-center space-x-1 text-sm text-gray-500">
                      <ArrowDownTrayIcon className="w-4 h-4" />
                      <span>{r.downloadCount}</span>
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${r.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                      {r.isActive ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end space-x-1">
                      <Link
                        href={`/admin/resources/${r.slug}/edit`}
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="Edit"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleDuplicate(r.slug)}
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="Duplicate as draft"
                      >
                        <DocumentDuplicateIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(r.slug)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Delete"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-5 py-10 text-center text-gray-400">
                    {search ? "No results found." : "No resources yet."}{" "}
                    <Link href="/admin/resources/new" className="text-blue-600">
                      Upload the first one
                    </Link>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {total > 20 && (
        <div className="flex items-center justify-center space-x-2 mt-4">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="btn-ghost text-sm disabled:opacity-50"
          >
            ← Previous
          </button>
          <span className="text-sm text-gray-500">
            Page {page} of {Math.ceil(total / 20)}
          </span>
          <button
            onClick={() => setPage(page + 1)}
            disabled={page >= Math.ceil(total / 20)}
            className="btn-ghost text-sm disabled:opacity-50"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
