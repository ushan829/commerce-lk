"use client";

import { useState, useEffect } from "react";
import { formatDate } from "@/lib/utils";
import {
  ArrowDownTrayIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  UserGroupIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import { SL_DISTRICTS } from "@/lib/profileCompletion";

interface AdminUser {
  _id: string;
  name: string;
  email: string;
  role: string;
  isVerified: boolean;
  phone?: string;
  school?: string;
  district?: string;
  medium?: string;
  alYear?: number;
  stream?: string;
  profilePicture?: string;
  downloadHistory?: { resourceId: string; downloadedAt: string }[];
  createdAt: string;
}

export default function UsersAdmin() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterDistrict, setFilterDistrict] = useState("");
  const [filterMedium, setFilterMedium] = useState("");
  const [filterYear, setFilterYear] = useState("");
  const [filterRole, setFilterRole] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      if (data.users) setUsers(data.users);
    } finally {
      setLoading(false);
    }
  }

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    const matchSearch = !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || (u.school || "").toLowerCase().includes(q);
    const matchDistrict = !filterDistrict || u.district === filterDistrict;
    const matchMedium = !filterMedium || u.medium === filterMedium;
    const matchYear = !filterYear || String(u.alYear) === filterYear;
    const matchRole = !filterRole || u.role === filterRole;
    return matchSearch && matchDistrict && matchMedium && matchYear && matchRole;
  });

  const stats = {
    total: users.length,
    verified: users.filter((u) => u.isVerified).length,
    students: users.filter((u) => u.role === "student").length,
    withSchool: users.filter((u) => u.school).length,
  };

  const alYears = [...new Set(users.map((u) => u.alYear).filter(Boolean))].sort() as number[];

  function exportCSV() {
    const headers = ["Name", "Email", "Role", "Verified", "Phone", "School", "District", "Medium", "A/L Year", "Stream", "Downloads", "Joined"];
    const rows = filtered.map((u) => [
      u.name, u.email, u.role, u.isVerified ? "Yes" : "No",
      u.phone || "", u.school || "", u.district || "",
      u.medium || "", u.alYear || "", u.stream || "",
      u.downloadHistory?.length || 0,
      new Date(u.createdAt).toLocaleDateString("en-GB"),
    ]);
    const csv = [headers, ...rows].map((r) => r.map((v) => `"${v}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `commerce-lk-users-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-sm text-gray-500 mt-1">{users.length} registered users</p>
        </div>
        <button
          onClick={exportCSV}
          className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <ArrowDownTrayIcon className="w-4 h-4" />
          Export CSV ({filtered.length})
        </button>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Users", value: stats.total, icon: <UserGroupIcon className="w-5 h-5" />, color: "text-blue-600 bg-blue-50" },
          { label: "Verified", value: stats.verified, icon: <CheckCircleIcon className="w-5 h-5" />, color: "text-green-600 bg-green-50" },
          { label: "Students", value: stats.students, icon: <UserGroupIcon className="w-5 h-5" />, color: "text-blue-600 bg-blue-50" },
          { label: "With School", value: stats.withSchool, icon: <UserGroupIcon className="w-5 h-5" />, color: "text-purple-600 bg-purple-50" },
        ].map((s) => (
          <div key={s.label} className="card p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg ${s.color} flex items-center justify-center`}>{s.icon}</div>
            <div>
              <p className="text-xl font-bold text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="card p-5 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <FunnelIcon className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-bold text-gray-900 uppercase tracking-widest">Filters & Search</span>
        </div>
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[240px]">
            <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text" 
              placeholder="Search by name, email, or school…" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border border-gray-200 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
          <select 
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all min-w-[140px]" 
            value={filterDistrict} 
            onChange={(e) => setFilterDistrict(e.target.value)}
          >
            <option value="">All Districts</option>
            {SL_DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
          <select 
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all min-w-[140px]" 
            value={filterMedium} 
            onChange={(e) => setFilterMedium(e.target.value)}
          >
            <option value="">All Mediums</option>
            <option value="sinhala">Sinhala</option>
            <option value="tamil">Tamil</option>
            <option value="english">English</option>
          </select>
          <select 
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all min-w-[140px]" 
            value={filterYear} 
            onChange={(e) => setFilterYear(e.target.value)}
          >
            <option value="">All A/L Years</option>
            {alYears.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
          <select 
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all min-w-[140px]" 
            value={filterRole} 
            onChange={(e) => setFilterRole(e.target.value)}
          >
            <option value="">All Roles</option>
            <option value="student">Students</option>
            <option value="admin">Admins</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-x-auto">
        {loading ? (
          <div className="py-16 text-center text-gray-400">
            <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-2" />
            Loading users...
          </div>
        ) : (
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="border-b border-gray-100 text-left">
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">User</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Email</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">School</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">District</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Medium</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">A/L Year</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Downloads</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Role</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((u) => (
                <tr key={u._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-sm font-bold text-blue-600 shrink-0">
                        {u.name?.[0]?.toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 text-sm truncate max-w-[120px]">{u.name}</p>
                        {u.isVerified
                          ? <span className="text-xs text-green-600">✓ verified</span>
                          : <span className="text-xs text-gray-400">unverified</span>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 max-w-[160px] truncate">{u.email}</td>
                  <td className="px-4 py-3 text-sm text-gray-500 max-w-[140px] truncate">
                    {u.school || <span className="text-gray-300">—</span>}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {u.district || <span className="text-gray-300">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    {u.medium ? (
                      <span className={`badge text-xs ${
                        u.medium === "sinhala" ? "bg-orange-100 text-orange-700" :
                        u.medium === "tamil" ? "bg-green-100 text-green-700" :
                        "bg-blue-100 text-blue-700"
                      }`}>
                        {u.medium.charAt(0).toUpperCase() + u.medium.slice(1)}
                      </span>
                    ) : <span className="text-gray-300 text-sm">—</span>}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {u.alYear || <span className="text-gray-300">—</span>}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {u.downloadHistory?.length || 0}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`badge ${u.role === "admin" ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-400">{formatDate(u.createdAt)}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-10 text-center text-gray-400">
                    {users.length === 0 ? "No users yet." : "No users match the current filters."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
