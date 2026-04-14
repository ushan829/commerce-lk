"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { 
  StarIcon, 
  TrashIcon, 
  FlagIcon, 
  MagnifyingGlassIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowTopRightOnSquareIcon
} from "@heroicons/react/24/outline";
import { StarIcon as StarSolid, FlagIcon as FlagSolid } from "@heroicons/react/24/solid";
import toast from "react-hot-toast";

interface Rating {
  _id: string;
  rating: number;
  comment?: string;
  flagged: boolean;
  adminNote?: string;
  createdAt: string;
  userId: {
    _id: string;
    name: string;
    email: string;
  };
  resourceId: {
    _id: string;
    title: string;
    slug: string;
    subject: { name: string; slug: string };
    medium: string;
    category: { name: string; slug: string };
  };
}

export default function AdminRatingsPage() {
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [stats, setStats] = useState({ total: 0, flagged: 0, recent: 0 });

  const fetchRatings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/ratings?page=${page}&search=${search}&filter=${filter}`);
      const data = await res.json();
      if (res.ok) {
        setRatings(data.ratings);
        setTotalPages(data.totalPages);
        setTotalCount(data.totalCount);
        
        // Basic stats for the header
        if (page === 1 && search === "" && filter === "all") {
          const flaggedCount = data.ratings.filter((r: Rating) => r.flagged).length;
          setStats({
            total: data.totalCount,
            flagged: flaggedCount, // This is just from the first page, ideal would be a separate API or aggregate
            recent: data.ratings.length // Placeholder
          });
        }
      }
    } catch (error) {
      toast.error("Failed to fetch ratings");
    } finally {
      setLoading(false);
    }
  }, [page, search, filter]);

  useEffect(() => {
    fetchRatings();
  }, [fetchRatings]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this review?")) return;

    try {
      const res = await fetch(`/api/admin/ratings/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Review deleted");
        fetchRatings();
      } else {
        toast.error("Failed to delete review");
      }
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  const handleToggleFlag = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/admin/ratings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ flagged: !currentStatus }),
      });
      if (res.ok) {
        toast.success(!currentStatus ? "Review flagged" : "Review unflagged");
        setRatings(prev => prev.map(r => r._id === id ? { ...r, flagged: !currentStatus } : r));
      } else {
        toast.error("Failed to update flag status");
      }
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-LK", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Ratings & Reviews</h1>
        <p className="text-gray-500 mt-1">Manage user ratings and comments</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Reviews</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{totalCount}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Flagged</p>
          <p className="text-3xl font-bold text-orange-600 mt-2">{ratings.filter(r => r.flagged).length}+</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">This Week</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">{totalCount > 10 ? "10+" : totalCount}</p>
        </div>
      </div>

      {/* Filters bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search username, comment, or resource..."
            className="w-full pl-11 pr-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <select
            className="bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            value={filter}
            onChange={(e) => { setFilter(e.target.value); setPage(1); }}
          >
            <option value="all">All Reviews</option>
            <option value="flagged">Flagged Only</option>
            <option value="recent">Recent (7 days)</option>
          </select>
          <p className="text-sm text-gray-500 whitespace-nowrap">
            Showing {ratings.length} of {totalCount} reviews
          </p>
        </div>
      </div>

      {/* Ratings Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Resource</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">User</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Rating</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Comment</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Date</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={6} className="px-6 py-8 h-20 bg-gray-50/50"></td>
                  </tr>
                ))
              ) : ratings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <StarIcon className="w-12 h-12 text-gray-200" />
                      <p className="text-gray-500 font-medium">No reviews found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                ratings.map((rating) => (
                  <tr key={rating._id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="max-w-[200px]">
                        <p className="font-bold text-gray-900 truncate" title={rating.resourceId?.title}>
                          {rating.resourceId?.title}
                        </p>
                        <div className="flex gap-1 mt-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded">
                            {rating.resourceId?.subject?.name}
                          </span>
                          <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded">
                            {rating.resourceId?.medium}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-gray-900">{rating.userId?.name}</span>
                        <span className="text-xs text-gray-500">{rating.userId?.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <StarSolid 
                            key={i} 
                            className={`w-4 h-4 ${i < rating.rating ? "text-yellow-400" : "text-gray-200"}`} 
                          />
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="max-w-[300px]">
                        <p className="text-sm text-gray-600 line-clamp-2" title={rating.comment}>
                          {rating.comment || <em className="text-gray-400">No comment</em>}
                        </p>
                        {rating.flagged && (
                          <span className="inline-flex items-center mt-1 px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800">
                            Flagged
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                      {formatDate(rating.createdAt)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/${rating.resourceId?.subject?.slug}/${rating.resourceId?.medium}/${rating.resourceId?.category?.slug}/${rating.resourceId?.slug}`}
                          target="_blank"
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                          title="View Resource"
                        >
                          <ArrowTopRightOnSquareIcon className="w-5 h-5" />
                        </Link>
                        <button
                          onClick={() => handleToggleFlag(rating._id, rating.flagged)}
                          className={`p-2 rounded-xl transition-all ${
                            rating.flagged 
                              ? "text-orange-600 bg-orange-50 hover:bg-orange-100" 
                              : "text-gray-400 hover:text-orange-600 hover:bg-orange-50"
                          }`}
                          title={rating.flagged ? "Unflag Review" : "Flag Review"}
                        >
                          {rating.flagged ? <FlagSolid className="w-5 h-5" /> : <FlagIcon className="w-5 h-5" />}
                        </button>
                        <button
                          onClick={() => handleDelete(rating._id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                          title="Delete Review"
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
            <p className="text-sm text-gray-500 font-medium">
              Page {page} of {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                className="p-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeftIcon className="w-5 h-5" />
              </button>
              <button
                disabled={page === totalPages}
                onClick={() => setPage(p => p + 1)}
                className="p-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRightIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
