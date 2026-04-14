"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { StarIcon as StarOutline, TrashIcon } from "@heroicons/react/24/outline";
import { StarIcon as StarSolid } from "@heroicons/react/24/solid";
import toast from "react-hot-toast";

interface Props {
  slug: string;
}

interface Review {
  _id: string;
  rating: number;
  comment: string;
  createdAt: string;
  userId: string;
  userName: string;
}

interface RatingData {
  avg: number;
  count: number;
  userRating: { rating: number; comment?: string } | null;
  breakdown: Record<number, number>;
  reviews: Review[];
}

function Stars({
  value,
  max = 5,
  interactive = false,
  hover = 0,
  onHover,
  onClick,
  size = "md",
}: {
  value: number;
  max?: number;
  interactive?: boolean;
  hover?: number;
  onHover?: (v: number) => void;
  onClick?: (v: number) => void;
  size?: "sm" | "md" | "lg";
}) {
  const sz = size === "lg" ? "w-8 h-8" : size === "sm" ? "w-4 h-4" : "w-6 h-6";
  const display = interactive && hover > 0 ? hover : value;

  return (
    <div className={`flex gap-0.5 ${interactive ? "cursor-pointer" : ""}`}>
      {Array.from({ length: max }, (_, i) => {
        const filled = i + 1 <= display;
        const Icon = filled ? StarSolid : StarOutline;
        return (
          <Icon
            key={i}
            className={`${sz} transition-colors ${
              filled ? "text-yellow-400" : "text-gray-300"
            } ${interactive ? "hover:text-yellow-300" : ""}`}
            onMouseEnter={() => onHover?.(i + 1)}
            onMouseLeave={() => onHover?.(0)}
            onClick={() => onClick?.(i + 1)}
          />
        );
      })}
    </div>
  );
}

const LABELS = ["", "Poor", "Fair", "Good", "Very Good", "Excellent"];

function BarRow({ star, count, total }: { star: number; count: number; total: number }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-500 w-4">{star}</span>
      <StarSolid className="w-3 h-3 text-yellow-400 shrink-0" />
      <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-gray-400 w-4">{count}</span>
    </div>
  );
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-LK", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default function RatingSection({ slug }: Props) {
  const { data: session } = useSession();
  const isLoggedIn = !!session?.user;

  const [data, setData] = useState<RatingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [hover, setHover] = useState(0);
  const [selected, setSelected] = useState(0);
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const isAdmin = (session?.user as { role?: string })?.role === "admin";

  const fetchRatings = useCallback(async () => {
    try {
      const res = await fetch(`/api/resources/${slug}/rate`);
      const d = await res.json();
      setData(d);
      if (d.userRating) {
        setSelected(d.userRating.rating);
        setComment(d.userRating.comment || "");
        setSaved(true);
      }
    } catch (err) {
      console.error("Failed to fetch ratings", err);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchRatings();
  }, [fetchRatings]);

  async function handleDeleteReview(reviewId: string) {
    if (!confirm("Are you sure you want to delete this review?")) return;

    try {
      const res = await fetch(`/api/admin/ratings/${reviewId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Review deleted");
        fetchRatings();
      } else {
        const d = await res.json();
        toast.error(d.error || "Failed to delete review");
      }
    } catch {
      toast.error("An error occurred");
    }
  }

  async function handleSubmit() {
    if (!selected) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/resources/${slug}/rate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating: selected, comment }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error);
      
      // Refresh all data from server to keep things in sync
      await fetchRatings();
      setSaved(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="py-4">
        <div className="h-4 bg-gray-100 rounded w-24 animate-pulse" />
      </div>
    );
  }

  const breakdown = data?.breakdown || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  const currentUserId = (session?.user as { id?: string })?.id || "";

  return (
    <div>
      <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <StarSolid className="w-5 h-5 text-yellow-400" />
        Ratings &amp; Reviews
      </h3>

      {/* Average display */}
      <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 rounded-xl">
        <div className="text-center">
          <p className="text-4xl font-bold text-gray-900">{data?.avg?.toFixed(1) || "—"}</p>
          <Stars value={data?.avg || 0} size="sm" />
          <p className="text-xs text-gray-400 mt-1">{data?.count || 0} rating{data?.count !== 1 ? "s" : ""}</p>
        </div>
        {data && data.count > 0 ? (
          <div className="flex-1 space-y-1">
            {[5, 4, 3, 2, 1].map((star) => (
              <BarRow key={star} star={star} count={breakdown[star] || 0} total={data.count} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400 flex-1">No ratings yet. Be the first!</p>
        )}
      </div>

      {/* Rate this resource */}
      {isLoggedIn ? (
        <div className="space-y-3 mb-6">
          <p className="text-sm font-medium text-gray-700">
            {saved ? "Your rating" : "Rate this resource"}
          </p>

          {saved && !isEditing(selected, data) ? (
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <Stars value={selected} size="md" />
                <span className="text-sm font-medium text-yellow-600">{LABELS[selected]}</span>
                <button
                  onClick={() => setSaved(false)}
                  className="text-xs text-blue-600 hover:underline ml-2"
                >
                  Edit
                </button>
              </div>
              {data?.userRating?.comment && (
                <p className="text-sm text-gray-600 bg-yellow-50 border border-yellow-100 rounded-lg px-3 py-2 italic mt-2">
                  &ldquo;{data.userRating.comment}&rdquo;
                </p>
              )}
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3">
                <Stars
                  value={selected}
                  size="lg"
                  interactive
                  hover={hover}
                  onHover={setHover}
                  onClick={(v) => { setSelected(v); setSaved(false); }}
                />
                {(hover || selected) > 0 && (
                  <span className="text-sm font-medium text-yellow-600">
                    {LABELS[hover || selected]}
                  </span>
                )}
              </div>
              
              <div className="mt-4 flex flex-col gap-3">
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Add a comment (optional, max 500 characters)"
                  maxLength={500}
                  rows={3}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-colors"
                />
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-400">{comment.length}/500</p>
                  <button
                    onClick={handleSubmit}
                    disabled={selected === 0 || saving}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-sm font-medium rounded-xl transition-colors"
                  >
                    {saving ? "Submitting..." : saved ? "Update Rating" : "Submit Rating"}
                  </button>
                </div>
              </div>
              
              {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
            </>
          )}
        </div>
      ) : (
        <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl border border-blue-100 mb-6">
          <Stars value={0} size="md" />
          <div>
            <p className="text-sm font-medium text-blue-800">Sign in to rate this resource</p>
            <p className="text-xs text-blue-600 mt-0.5">
              <Link href="/login" className="font-semibold hover:underline">Sign in</Link>
              {" "}or{" "}
              <Link href="/register" className="font-semibold hover:underline">create a free account</Link>
            </p>
          </div>
        </div>
      )}

      {/* Reviews list */}
      {data && data.reviews.length > 0 && (
        <div className="space-y-4 mt-8 pt-6 border-t border-gray-100">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">
            Recent Reviews ({data.reviews.length})
          </p>
          <div className="space-y-6">
            {data.reviews.map((review, idx) => (
              <div key={idx} className="border-b border-gray-50 pb-6 last:border-0">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-blue-600 text-xs font-bold">
                        {review.userName?.charAt(0).toUpperCase() || "?"}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {review.userName}
                      {review.userId === currentUserId && (
                        <span className="ml-2 text-[10px] bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded-full font-bold uppercase">You</span>
                      )}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-400">{formatDate(review.createdAt)}</span>
                    {isAdmin && (
                      <button
                        onClick={() => handleDeleteReview(review._id)}
                        className="text-gray-400 hover:text-red-600 transition-colors p-1"
                        title="Delete Review"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-0.5 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <StarSolid
                      key={star}
                      className={`w-4 h-4 ${star <= review.rating ? "text-yellow-400" : "text-gray-200"}`}
                    />
                  ))}
                </div>
                
                {review.comment && (
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {review.comment}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function isEditing(selected: number, data: RatingData | null) {
  return data?.userRating && selected !== data.userRating.rating;
}
