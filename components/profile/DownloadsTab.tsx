"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowDownTrayIcon,
  DocumentIcon,
  ArrowTopRightOnSquareIcon,
} from "@heroicons/react/24/outline";

interface DownloadItem {
  resource: {
    _id: string;
    title: string;
    slug: string;
    subject: { name: string; slug: string };
    category: { name: string; slug?: string };
    medium: string;
    fileType?: string;
    fileSize?: number;
    thumbnail?: string;
  } | null;
  downloadedAt: string;
}

export default function DownloadsTab() {
  const [downloads, setDownloads] = useState<DownloadItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/user/downloads")
      .then((res) => res.json())
      .then((data) => {
        setDownloads(data.downloads || []);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="py-20 text-center text-gray-400">Loading downloads...</div>;
  }

  if (downloads.length === 0) {
    return (
      <div className="py-24 text-center bg-gray-50 rounded-3xl border border-gray-100">
        <ArrowDownTrayIcon className="w-16 h-16 mx-auto mb-6 text-gray-200" />
        <h3 className="text-xl font-bold text-gray-900 mb-2">No downloads yet</h3>
        <p className="text-gray-500 mb-8">Resources you download will appear here for quick access.</p>
        <Link href="/" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold transition-colors inline-block">
          Browse Resources
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {downloads.map((d, i) => {
        if (!d.resource) return null;
        const catSlug = d.resource.category?.slug || d.resource.category?.name?.toLowerCase().replace(/ /g, "-");
        const href = `/${d.resource.subject?.slug}/${d.resource.medium}/${catSlug}/${d.resource.slug}`;
        
        return (
          <div key={i} className="bg-white border border-gray-100 rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-6 hover:shadow-md transition-shadow">
            <div className="w-full sm:w-24 aspect-video sm:aspect-square bg-gray-50 rounded-xl overflow-hidden shrink-0 flex items-center justify-center">
              {d.resource.thumbnail ? (
                <Image src={d.resource.thumbnail} alt={d.resource.title} width={100} height={100} className="object-cover w-full h-full" unoptimized />
              ) : (
                <DocumentIcon className="w-8 h-8 text-gray-200" />
              )}
            </div>

            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-wrap justify-center sm:justify-start gap-2 mb-2">
                <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-600 text-[10px] font-bold uppercase tracking-wider">
                  {d.resource.subject.name}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 text-[10px] font-bold uppercase tracking-wider">
                  {d.resource.category?.name}
                </span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-1">{d.resource.title}</h3>
              <p className="text-sm text-gray-500">Downloaded on {new Date(d.downloadedAt).toLocaleDateString()}</p>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Link href={href} className="flex-1 sm:flex-none bg-blue-50 text-blue-600 px-4 py-2 rounded-xl font-bold text-sm hover:bg-blue-100 transition-colors flex items-center justify-center gap-2">
                <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                View
              </Link>
              <Link href={href} className="flex-1 sm:flex-none bg-blue-600 text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                <ArrowDownTrayIcon className="w-4 h-4" />
                Download
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
}
