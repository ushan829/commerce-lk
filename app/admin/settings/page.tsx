"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import Link from "next/link";

export default function SettingsPage() {
  const [seeding, setSeeding] = useState(false);

  const handleSeed = async () => {
    if (!confirm("This will seed subjects and categories into the database. Continue?")) return;
    setSeeding(true);
    try {
      const res = await fetch("/api/admin/seed", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success("Database seeded successfully!");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Seed failed");
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Admin panel settings and utilities</p>
      </div>

      <div className="space-y-6">
        {/* Quick Setup */}
        <div className="card p-6">
          <h2 className="font-bold text-gray-900 text-lg mb-4 border-b border-gray-100 pb-3">Quick Setup</h2>
          <div className="space-y-6">
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <h3 className="text-sm font-bold text-gray-900 mb-1">Initialize Admin User</h3>
              <p className="text-xs text-gray-500 mb-4 leading-relaxed">
                Creates the first admin account using <code className="bg-gray-200 px-1 rounded text-blue-700">ADMIN_EMAIL</code> and <code className="bg-gray-200 px-1 rounded text-blue-700">ADMIN_PASSWORD</code> environment variables.
                Only works if no admin exists.
              </p>
              <a
                href="/api/admin/seed"
                target="_blank"
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 transition-all shadow-sm"
              >
                Initialize Admin (GET)
              </a>
            </div>

            <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100">
              <h3 className="text-sm font-bold text-blue-900 mb-1">Seed Default Data</h3>
              <p className="text-xs text-blue-600/70 mb-4 leading-relaxed">
                Populates 8 default subjects (Accounting, Business Studies, Economics, etc.)
                and 7 default categories into the database.
              </p>
              <button
                onClick={handleSeed}
                disabled={seeding}
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-8 py-3 rounded-xl text-sm font-bold shadow-lg shadow-blue-600/20 transition-all"
              >
                {seeding ? "Seeding..." : "Seed Subjects & Categories"}
              </button>
            </div>
          </div>
        </div>

        {/* Site Info */}
        <div className="card p-6">
          <h2 className="font-bold text-gray-900 text-lg mb-4 border-b border-gray-100 pb-3">Platform Information</h2>
          <dl className="space-y-4">
            {[
              { label: "Platform", value: "Commerce.lk" },
              { label: "Framework", value: "Next.js 15 (App Router)" },
              { label: "Database", value: "MongoDB (Mongoose)" },
              { label: "File Storage", value: "Cloudflare R2" },
              { label: "Authentication", value: "NextAuth.js (JWT)" },
            ].map((item) => (
              <div key={item.label} className="flex justify-between items-center text-sm border-b border-gray-50 pb-2 last:border-0 last:pb-0">
                <dt className="text-gray-500 font-medium">{item.label}</dt>
                <dd className="font-bold text-gray-900">{item.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Quick Links */}
        <div className="card p-6">
          <h2 className="font-bold text-gray-900 text-lg mb-4 border-b border-gray-100 pb-3">Quick Links</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Subjects", href: "/admin/subjects" },
              { label: "Categories", href: "/admin/categories" },
              { label: "Resources", href: "/admin/resources" },
              { label: "Upload", href: "/admin/resources/new" },
              { label: "Ads", href: "/admin/ads" },
              { label: "Users", href: "/admin/users" },
              { label: "Website", href: "/" },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                target={link.href === "/" ? "_blank" : undefined}
                className="px-4 py-3 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition-all text-center"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
