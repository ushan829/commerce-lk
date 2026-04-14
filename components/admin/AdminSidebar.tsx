"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  BookOpenIcon,
  HomeIcon,
  AcademicCapIcon,
  TagIcon,
  DocumentTextIcon,
  MegaphoneIcon,
  UsersIcon,
  ArrowLeftOnRectangleIcon,
  Cog6ToothIcon,
  InboxArrowDownIcon,
  ClockIcon,
  FlagIcon,
  ChartBarIcon,
  ArrowUpTrayIcon,
} from "@heroicons/react/24/outline";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: HomeIcon, exact: true },
  { href: "/admin/subjects", label: "Subjects", icon: AcademicCapIcon },
  { href: "/admin/categories", label: "Categories", icon: TagIcon },
  { href: "/admin/resources", label: "Resources", icon: DocumentTextIcon },
  { href: "/admin/resources/import", label: "Import CSV", icon: ArrowUpTrayIcon },
  { href: "/admin/ads", label: "Advertisements", icon: MegaphoneIcon },
  { href: "/admin/users", label: "Users", icon: UsersIcon },
  { href: "/admin/requests", label: "Requests", icon: InboxArrowDownIcon },
  { href: "/admin/reports",  label: "File Reports", icon: FlagIcon },
  { href: "/admin/analytics", label: "Analytics", icon: ChartBarIcon },
  { href: "/admin/exam-dates", label: "Exam Countdown", icon: ClockIcon },
  { href: "/admin/settings", label: "Settings", icon: Cog6ToothIcon },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col shrink-0">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-gray-200">
        <Link href="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <BookOpenIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="font-bold text-gray-900 text-sm">Commerce.lk</div>
            <div className="text-xs text-gray-400">Admin Panel</div>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              isActive(item.href, item.exact)
                ? "bg-blue-50 text-blue-700"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }`}
          >
            <item.icon className="w-5 h-5 shrink-0" />
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-gray-200 space-y-1">
        <Link
          href="/"
          target="_blank"
          className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50"
        >
          <BookOpenIcon className="w-5 h-5" />
          <span>View Website</span>
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          aria-label="Sign Out"
          className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50"
        >
          <ArrowLeftOnRectangleIcon className="w-5 h-5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
