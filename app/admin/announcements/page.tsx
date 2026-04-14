"use client";

import { useState, useEffect, useCallback } from "react";
import { 
  MegaphoneIcon, 
  TrashIcon, 
  PlusIcon, 
  XMarkIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
  NoSymbolIcon,
  EyeIcon
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

interface Announcement {
  _id: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  isActive: boolean;
  link: string;
  linkText: string;
  dismissible: boolean;
  expiresAt: string | null;
  createdAt: string;
}

const typeStyles = {
  info: 'bg-blue-600 text-white',
  warning: 'bg-yellow-500 text-white',
  success: 'bg-green-600 text-white',
  error: 'bg-red-600 text-white',
};

const typeIcons = {
  info: InformationCircleIcon,
  warning: ExclamationCircleIcon,
  success: CheckCircleIcon,
  error: NoSymbolIcon,
};

export default function AdminAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    message: "",
    type: "info" as "info" | "warning" | "success" | "error",
    isActive: true,
    link: "",
    linkText: "",
    dismissible: true,
    expiresAt: "",
  });

  const fetchAnnouncements = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/announcements");
      const data = await res.json();
      if (res.ok) {
        setAnnouncements(data.announcements);
      }
    } catch (error) {
      toast.error("Failed to fetch announcements");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.message) return toast.error("Message is required");

    try {
      const res = await fetch("/api/admin/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        toast.success("Announcement created");
        setShowForm(false);
        setFormData({
          message: "",
          type: "info",
          isActive: true,
          link: "",
          linkText: "",
          dismissible: true,
          expiresAt: "",
        });
        fetchAnnouncements();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to create announcement");
      }
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  const handleToggleActive = async (id: string, current: boolean) => {
    try {
      const res = await fetch(`/api/admin/announcements/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !current }),
      });
      if (res.ok) {
        toast.success(!current ? "Activated" : "Deactivated");
        fetchAnnouncements();
      }
    } catch (error) {
      toast.error("Failed to update");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this announcement?")) return;
    try {
      const res = await fetch(`/api/admin/announcements/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Deleted");
        fetchAnnouncements();
      }
    } catch (error) {
      toast.error("Failed to delete");
    }
  };

  const isExpired = (expiresAt: string | null) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Site Announcements</h1>
          <p className="text-gray-500 mt-1">Manage site-wide announcement banners</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary flex items-center gap-2"
        >
          {showForm ? <XMarkIcon className="w-5 h-5" /> : <PlusIcon className="w-5 h-5" />}
          {showForm ? "Cancel" : "New Announcement"}
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm space-y-8 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Message</label>
                  <textarea
                    required
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 min-h-[100px]"
                    placeholder="E.g. We have added new accounting past papers!"
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Type</label>
                    <select
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      value={formData.type}
                      onChange={(e) => setFormData({...formData, type: e.target.value as any})}
                    >
                      <option value="info">Info (Blue)</option>
                      <option value="warning">Warning (Yellow)</option>
                      <option value="success">Success (Green)</option>
                      <option value="error">Error (Red)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Expires At</label>
                    <input
                      type="datetime-local"
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      value={formData.expiresAt}
                      onChange={(e) => setFormData({...formData, expiresAt: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Link URL</label>
                    <input
                      type="text"
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      placeholder="https://..."
                      value={formData.link}
                      onChange={(e) => setFormData({...formData, link: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Link Text</label>
                    <input
                      type="text"
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      placeholder="Learn more"
                      value={formData.linkText}
                      onChange={(e) => setFormData({...formData, linkText: e.target.value})}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-blue-600 rounded"
                      checked={formData.dismissible}
                      onChange={(e) => setFormData({...formData, dismissible: e.target.checked})}
                    />
                    <span className="text-sm font-medium text-gray-700">Dismissible</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-blue-600 rounded"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                    />
                    <span className="text-sm font-medium text-gray-700">Active</span>
                  </label>
                </div>
              </div>

              <button type="submit" className="btn-primary w-full py-3">Create Announcement</button>
            </form>

            <div className="space-y-4">
              <div className="flex items-center gap-2 text-gray-500 text-sm font-bold uppercase tracking-wider">
                <EyeIcon className="w-5 h-5" />
                Live Preview
              </div>
              <div className="p-8 bg-gray-50 rounded-2xl border border-dashed border-gray-300 flex items-center justify-center min-h-[200px]">
                <div className="w-full">
                  <div className={`${typeStyles[formData.type]} px-6 py-3 flex items-center justify-center gap-3 text-sm font-bold rounded-xl shadow-lg`}>
                    <span className="text-center">
                      {formData.message || "Your announcement message will appear here..."}
                      {formData.link && (
                        <span className="ml-2 underline">{formData.linkText || 'Learn more'}</span>
                      )}
                    </span>
                    {formData.dismissible && (
                      <XMarkIcon className="w-4 h-4 shrink-0" />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Announcements List */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Message</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Type</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Status</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Expires</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">Loading...</td></tr>
              ) : announcements.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-500">No announcements found.</td></tr>
              ) : (
                announcements.map((a) => (
                  <tr key={a._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="max-w-md">
                        <p className="text-sm font-bold text-gray-900 line-clamp-2">{a.message}</p>
                        {a.link && <p className="text-xs text-blue-600 mt-1 truncate">{a.link}</p>}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${
                        a.type === 'success' ? 'bg-green-100 text-green-700' :
                        a.type === 'warning' ? 'bg-yellow-100 text-yellow-700' :
                        a.type === 'error' ? 'bg-red-100 text-red-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {a.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {isExpired(a.expiresAt) ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold uppercase bg-red-100 text-red-700">Expired</span>
                      ) : a.isActive ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold uppercase bg-green-100 text-green-700">Active</span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold uppercase bg-gray-100 text-gray-700">Inactive</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                      {a.expiresAt ? new Date(a.expiresAt).toLocaleDateString() : "Never"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleToggleActive(a._id, a.isActive)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            a.isActive 
                              ? "bg-gray-100 text-gray-600 hover:bg-gray-200" 
                              : "bg-green-100 text-green-700 hover:bg-green-200"
                          }`}
                        >
                          {a.isActive ? "Deactivate" : "Activate"}
                        </button>
                        <button
                          onClick={() => handleDelete(a._id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </div>
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
