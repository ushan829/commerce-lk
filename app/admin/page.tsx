import { Metadata } from "next";
import Link from "next/link";
import dbConnect from "@/lib/mongodb";
import Subject from "@/models/Subject";
import Category from "@/models/Category";
import Resource from "@/models/Resource";
import User from "@/models/User";
import Ad from "@/models/Ad";
import {
  AcademicCapIcon,
  TagIcon,
  DocumentTextIcon,
  UsersIcon,
  MegaphoneIcon,
  ArrowDownTrayIcon,
} from "@heroicons/react/24/outline";

export const metadata: Metadata = { title: "Admin Dashboard | Commerce.lk" };

async function getStats() {
  await dbConnect();
  const [subjects, categories, resources, users, ads, downloadStats, recent] =
    await Promise.all([
      Subject.countDocuments(),
      Category.countDocuments(),
      Resource.countDocuments({ isActive: true }),
      User.countDocuments({ role: "student" }),
      Ad.countDocuments({ isActive: true }),
      Resource.aggregate([
        { $group: { _id: null, total: { $sum: "$downloadCount" } } },
      ]),
      Resource.find({ isActive: true })
        .populate("subject", "name slug color")
        .populate("category", "name")
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
    ]);
  return {
    subjects,
    categories,
    resources,
    users,
    ads,
    downloads: downloadStats[0]?.total || 0,
    recent: JSON.parse(JSON.stringify(recent)),
  };
}

const statCards = [
  {
    key: "subjects",
    label: "Subjects",
    icon: AcademicCapIcon,
    color: "blue",
    href: "/admin/subjects",
  },
  {
    key: "categories",
    label: "Categories",
    icon: TagIcon,
    color: "green",
    href: "/admin/categories",
  },
  {
    key: "resources",
    label: "Resources",
    icon: DocumentTextIcon,
    color: "purple",
    href: "/admin/resources",
  },
  {
    key: "users",
    label: "Students",
    icon: UsersIcon,
    color: "orange",
    href: "/admin/users",
  },
  {
    key: "ads",
    label: "Active Ads",
    icon: MegaphoneIcon,
    color: "pink",
    href: "/admin/ads",
  },
  {
    key: "downloads",
    label: "Total Downloads",
    icon: ArrowDownTrayIcon,
    color: "teal",
    href: "/admin/resources",
  },
];

const colorMap: Record<string, string> = {
  blue: "bg-blue-50 text-blue-600",
  green: "bg-green-50 text-green-600",
  purple: "bg-purple-50 text-purple-600",
  orange: "bg-orange-50 text-orange-600",
  pink: "bg-pink-50 text-pink-600",
  teal: "bg-teal-50 text-teal-600",
};

export default async function AdminDashboard() {
  const stats = await getStats();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">
          Overview of Commerce.lk platform
        </p>
      </div>

      {/* Setup hint */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-700">
        <strong>Quick Setup:</strong> Visit{" "}
        <a
          href="/api/admin/seed"
          target="_blank"
          className="underline font-medium"
        >
          /api/admin/seed
        </a>{" "}
        (GET) to create the first admin user, then{" "}
        <a
          href="/api/admin/seed"
          className="underline font-medium"
          target="_blank"
        >
          POST to /api/admin/seed
        </a>{" "}
        to populate default subjects and categories.
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {statCards.map((card) => (
          <Link
            key={card.key}
            href={card.href}
            className="card p-5 hover:shadow-card-hover transition-shadow"
          >
            <div className="flex items-center space-x-3">
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorMap[card.color]}`}
              >
                <card.icon className="w-5 h-5" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {stats[card.key as keyof typeof stats] as number}
                </div>
                <div className="text-xs text-gray-500">{card.label}</div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent Resources */}
      <div className="card">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Recent Resources</h2>
          <Link
            href="/admin/resources"
            className="text-sm text-blue-600 hover:underline"
          >
            View all
          </Link>
        </div>
        <div className="divide-y divide-gray-50">
          {stats.recent.map(
            (r: {
              _id: string;
              title: string;
              slug: string;
              medium: string;
              downloadCount: number;
              subject: { name: string; color?: string };
              category: { name: string };
              createdAt: string;
            }) => (
              <div
                key={r._id}
                className="flex items-center justify-between p-4"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {r.title}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {r.subject?.name} · {r.category?.name} · {r.medium}
                  </p>
                </div>
                <div className="text-xs text-gray-400 shrink-0 ml-4">
                  {r.downloadCount} downloads
                </div>
              </div>
            )
          )}
          {stats.recent.length === 0 && (
            <div className="p-8 text-center text-gray-400 text-sm">
              No resources yet.{" "}
              <Link href="/admin/resources/new" className="text-blue-600">
                Upload the first one
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
