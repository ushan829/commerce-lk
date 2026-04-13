"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { BookmarkIcon, TrashIcon, ArrowDownTrayIcon, DocumentIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

interface BookmarkItem {
  _id: string;
  title: string;
  slug: string;
  subject: { name: string; slug: string };
  category: { name: string; slug?: string };
  medium: string;
  thumbnail?: string;
}

export default function BookmarksTab() {
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/user/bookmarks")
      .then((res) => res.json())
      .then((data) => {
        setBookmarks(data.bookmarks || []);
        setLoading(false);
      });
  }, []);

  async function handleRemove(id: string) {
    try {
      const res = await fetch(`/api/user/bookmarks/${id}`, { method: "DELETE" });
      if (res.ok) {
        setBookmarks(prev => prev.filter(b => b._id !== id));
        toast.success("Bookmark removed");
      }
    } catch (err) {
      toast.error("Failed to remove bookmark");
    }
  }

  if (loading) {
    return <div className="py-20 text-center text-gray-400">Loading bookmarks...</div>;
  }

  if (bookmarks.length === 0) {
    return (
      <div className="py-24 text-center bg-gray-50 rounded-3xl border border-gray-100">
        <BookmarkIcon className="w-16 h-16 mx-auto mb-6 text-gray-200" />
        <h3 className="text-xl font-bold text-gray-900 mb-2">No bookmarks yet</h3>
        <p className="text-gray-500 mb-8">Save resources to access them quickly later.</p>
        <Link href="/" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold transition-colors inline-block">
          Browse Resources
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      {bookmarks.map(b => {
        const catSlug = b.category?.slug || b.category?.name?.toLowerCase().replace(/ /g, "-");
        const href = `/${b.subject?.slug}/${b.medium}/${catSlug}/${b.slug}`;
        
        return (
          <div key={b._id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <div className="aspect-video bg-gray-50 relative">
              {b.thumbnail ? (
                <Image src={b.thumbnail} alt={b.title} fill className="object-cover" unoptimized />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                   <DocumentIcon className="w-12 h-12 text-gray-200" />
                </div>
              )}
            </div>
            
            <div className="p-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-600 text-[10px] font-bold uppercase tracking-wider">
                  {b.subject.name}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 text-[10px] font-bold uppercase tracking-wider capitalize">
                  {b.medium}
                </span>
              </div>
              
              <Link href={href}>
                <h3 className="text-lg font-bold text-gray-900 line-clamp-2 mb-6 hover:text-blue-600 transition-colors">
                  {b.title}
                </h3>
              </Link>
              
              <div className="flex gap-2">
                <Link
                  href={href}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"
                >
                  <ArrowDownTrayIcon className="w-4 h-4" />
                  Download
                </Link>
                <button
                  onClick={() => handleRemove(b._id)}
                  className="w-12 h-12 flex items-center justify-center bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-colors"
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
