"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowDownTrayIcon,
  EyeIcon,
  CalendarIcon,
  AdjustmentsHorizontalIcon,
} from "@heroicons/react/24/outline";
import { formatDate } from "@/lib/utils";

interface Resource {
  _id: string;
  title: string;
  slug: string;
  thumbnail?: string;
  ogImage?: string;
  downloadCount: number;
  viewCount: number;
  createdAt: string;
}

interface Props {
  resources: Resource[];
  subjectName: string;
  categoryName: string;
  baseUrl: string;
}

export default function ResourceListClient({ resources, subjectName, categoryName, baseUrl }: Props) {
  const [mounted, setMounted] = useState(false);
  const [filter, setFilter] = useState("latest"); // 'all', 'latest', 'popular'
  const [sortedResources, setSortedResources] = useState(resources);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    let sorted = [...resources];
    if (filter === "latest") {
      sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (filter === "popular") {
      sorted.sort((a, b) => b.downloadCount - a.downloadCount);
    }
    setSortedResources(sorted);
  }, [filter, resources]);

  if (!mounted) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-96 bg-gray-50 rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Quick Filter */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-100">
        <div className="flex items-center gap-2 text-gray-600 font-medium">
          <AdjustmentsHorizontalIcon className="w-5 h-5" />
          <span>Quick Filter</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {[
            { id: "all", label: "All Resources" },
            { id: "latest", label: "Latest Added" },
            { id: "popular", label: "Most Popular" },
          ].map((option) => (
            <button
              key={option.id}
              onClick={() => setFilter(option.id)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                filter === option.id
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                  : "bg-white text-gray-600 border border-gray-200 hover:border-blue-300 hover:text-blue-600"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {sortedResources.map((resource) => (
          <div
            key={resource._id}
            className="group bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
          >
            <Link href={`${baseUrl}/${resource.slug}`} className="block relative aspect-video bg-gray-50">
              {resource.thumbnail || resource.ogImage ? (
                <Image
                  src={(resource.thumbnail || resource.ogImage)!}
                  alt={resource.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  unoptimized
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
                  <div className="text-blue-200 font-bold text-6xl opacity-20 uppercase tracking-tighter -rotate-12 select-none">
                    {categoryName}
                  </div>
                </div>
              )}
              <div className="absolute inset-0 bg-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                 <span className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform">
                    View Resource
                 </span>
              </div>
            </Link>

            <div className="p-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-600 text-[10px] font-bold uppercase tracking-wider">
                  {subjectName}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 text-[10px] font-bold uppercase tracking-wider">
                  {categoryName}
                </span>
              </div>
              
              <Link href={`${baseUrl}/${resource.slug}`} className="block">
                <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 mb-4 leading-snug">
                  {resource.title}
                </h3>
              </Link>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-gray-500 text-sm">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <ArrowDownTrayIcon className="w-4 h-4" />
                    <span>{resource.downloadCount || 0}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <EyeIcon className="w-4 h-4" />
                    <span>{resource.viewCount || 0}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <CalendarIcon className="w-4 h-4" />
                  <span>{formatDate(resource.createdAt)}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {sortedResources.length === 0 && (
        <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-100">
          <p className="text-gray-400 text-lg">No resources found in this category yet.</p>
        </div>
      )}
    </div>
  );
}
