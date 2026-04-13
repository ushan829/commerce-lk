"use client";

import { useState, useEffect } from "react";
import { signOut } from "next-auth/react";
import toast from "react-hot-toast";
import {
  KeyIcon,
  BellIcon,
  ShieldCheckIcon,
  TrashIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";

interface Props {
  profile: { email: string; isVerified: boolean };
}

export default function SettingsTab({ profile }: Props) {
  const [pw, setPw] = useState({ current: "", next: "", confirm: "" });
  const [loading, setLoading] = useState(false);

  const handlePwChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pw.next !== pw.confirm) {
      toast.error("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/user/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: pw.current, newPassword: pw.next }),
      });
      if (res.ok) {
        toast.success("Password updated successfully");
        setPw({ current: "", next: "", confirm: "" });
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to update password");
      }
    } catch (err) {
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-8">
      {/* Change Password */}
      <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
            <KeyIcon className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">Change Password</h3>
        </div>
        
        <form onSubmit={handlePwChange} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-2">Current Password</label>
              <input
                type="password"
                value={pw.current}
                onChange={(e) => setPw({ ...pw, current: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                required
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-2">New Password</label>
              <input
                type="password"
                value={pw.next}
                onChange={(e) => setPw({ ...pw, next: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                required
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-2">Confirm New Password</label>
              <input
                type="password"
                value={pw.confirm}
                onChange={(e) => setPw({ ...pw, confirm: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                required
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold transition-colors disabled:opacity-50"
          >
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>

      {/* Notifications & Privacy */}
      <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
            <BellIcon className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">Notifications & Privacy</h3>
        </div>
        
        <div className="space-y-6">
          <div className="flex items-center justify-between py-4 border-b border-gray-50">
            <div>
              <h4 className="font-bold text-gray-900">Email Notifications</h4>
              <p className="text-sm text-gray-500">Receive updates about new resources and site news.</p>
            </div>
            <div className="w-12 h-6 bg-blue-600 rounded-full relative">
              <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
            </div>
          </div>
          <div className="flex items-center justify-between py-4">
            <div>
              <h4 className="font-bold text-gray-900">Public Profile</h4>
              <p className="text-sm text-gray-500">Allow others to see your achievements and downloads.</p>
            </div>
            <div className="w-12 h-6 bg-gray-200 rounded-full relative">
              <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-red-50 p-8 rounded-3xl border border-red-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center text-red-600">
            <TrashIcon className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-red-900">Danger Zone</h3>
        </div>
        <p className="text-red-700 mb-8 font-medium">Once you delete your account, there is no going back. Please be certain.</p>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => {
              if(confirm("Are you sure?")) {
                 signOut({ callbackUrl: "/" });
              }
            }}
            className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-xl font-bold transition-colors"
          >
            Delete Account
          </button>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex items-center gap-2 px-8 py-3 bg-white border border-red-200 text-red-600 rounded-xl font-bold hover:bg-red-50 transition-colors shadow-sm"
          >
            <ArrowRightOnRectangleIcon className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
