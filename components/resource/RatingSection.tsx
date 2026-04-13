"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { StarIcon as StarOutline } from "@heroicons/react/24/outline";
import { StarIcon as StarSolid } from "@heroicons/react/24/solid";

interface Props {
  slug: string;
}

interface Review {
  rating: number;
  comment: string;
  createdAt: string;
  userId: string;
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

function formatRelative(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
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

  useEffect(() => {
    fetch(`/api/resources/${slug}/rate`)
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        if (d.userRating) {
          setSelected(d.userRating.rating);
          setComment(d.userRating.comment || "");
          setSaved(true);
        }
      })
      .finally(() => setLoading(false));
  }, [slug]);

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
      setData((prev) => {
        if (!prev) return prev;
        // Update or insert this user's review in the list
        const userId = (session?.user as { id?: string })?.id || "";
        const updatedReviews = comment.trim()
          ? [
              { rating: selected, comment: comment.trim(), createdAt: new Date().toISOString(), userId },
              ...prev.reviews.filter((r) => r.userId !== userId),
            ].slice(0, 10)
          : prev.reviews.filter((r) => r.userId !== userId);
        return {
          ...prev,
          avg: d.avg,
          count: d.count,
          userRating: { rating: selected, comment: comment.trim() },
          reviews: updatedReviews,
        };
      });
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
                <p className="text-sm text-gray-600 bg-yellow-50 border border-yellow-100 rounded-lg px-3 py-2">
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
              <textarea
                className="input text-sm resize-none"
                rows={2}
                placeholder="Add a comment (optional, max 500 characters)"
                maxLength={500}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
              {error && <p className="text-xs text-red-500">{error}</p>}
              <button
                onClick={handleSubmit}
                disabled={!selected || saving}
                className="btn-primary py-2 px-5 text-sm disabled:opacity-50"
              >
                {saving ? "Saving..." : saved ? "Update Rating" : "Submit Rating"}
              </button>
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
        <div className="space-y-3">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
            Comments ({data.reviews.length})
          </p>
          {data.reviews.map((review, idx) => (
            <div
              key={idx}
              className={`flex gap-3 p-3 rounded-xl border ${
                review.userId === currentUserId
                  ? "bg-yellow-50 border-yellow-100"
                  : "bg-gray-50 border-gray-100"
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0 text-xs font-bold text-blue-600">
                {review.userId === currentUserId ? "You" : "★"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Stars value={review.rating} size="sm" />
                  <span className="text-xs text-gray-400">{formatRelative(review.createdAt)}</span>
                  {review.userId === currentUserId && (
                    <span className="text-xs bg-yellow-200 text-yellow-800 px-1.5 py-0.5 rounded font-medium">You</span>
                  )}
                </div>
                <p className="text-sm text-gray-700 break-words">{review.comment}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function isEditing(selected: number, data: RatingData | null) {
  return data?.userRating && selected !== data.userRating.rating;
}
