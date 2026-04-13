"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { BookmarkIcon as BookmarkOutline } from "@heroicons/react/24/outline";
import { BookmarkIcon as BookmarkSolid } from "@heroicons/react/24/solid";
import Link from "next/link";

interface Props {
  resourceId: string;
}

export default function BookmarkButton({ resourceId }: Props) {
  const { data: session } = useSession();
  const isLoggedIn = !!session?.user;

  const [bookmarked, setBookmarked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [showGuest, setShowGuest] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) {
      setLoading(false);
      return;
    }
    fetch(`/api/user/bookmarks/check?resourceId=${resourceId}`)
      .then((r) => r.json())
      .then((d) => setBookmarked(d.bookmarked))
      .finally(() => setLoading(false));
  }, [resourceId, isLoggedIn]);

  async function toggle() {
    if (!isLoggedIn) {
      setShowGuest(true);
      return;
    }
    setBusy(true);
    try {
      if (bookmarked) {
        await fetch(`/api/user/bookmarks/${resourceId}`, { method: "DELETE" });
        setBookmarked(false);
      } else {
        await fetch("/api/user/bookmarks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ resourceId }),
        });
        setBookmarked(true);
      }
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <div className="w-9 h-9 rounded-full bg-gray-100 animate-pulse" />
    );
  }

  return (
    <>
      <button
        onClick={toggle}
        disabled={busy}
        title={bookmarked ? "Remove bookmark" : "Save for later"}
        className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-full border font-semibold text-sm transition-all duration-200 disabled:opacity-50 ${
          bookmarked
            ? "bg-amber-50 border-amber-400 text-amber-700 hover:bg-amber-100"
            : "border-gray-200 text-gray-500 hover:border-amber-400 hover:text-amber-600 hover:bg-amber-50"
        }`}
      >
        {bookmarked ? (
          <BookmarkSolid className="w-4 h-4" />
        ) : (
          <BookmarkOutline className="w-4 h-4" />
        )}
        {bookmarked ? "Saved" : "Save"}
      </button>

      {/* Guest nudge */}
      {showGuest && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowGuest(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full">
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <BookmarkSolid className="w-6 h-6 text-amber-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 text-center mb-2">Save for Later</h3>
            <p className="text-sm text-gray-500 text-center mb-5">
              Create a free account to bookmark resources and access them anytime from your profile.
            </p>
            <div className="flex gap-3">
              <Link
                href="/register"
                className="flex-1 btn-primary py-2.5 text-sm text-center"
              >
                Create Free Account
              </Link>
              <Link
                href="/login"
                className="flex-1 btn-secondary py-2.5 text-sm text-center"
              >
                Sign In
              </Link>
            </div>
            <button
              onClick={() => setShowGuest(false)}
              className="w-full mt-3 text-xs text-gray-400 hover:text-gray-600"
            >
              Maybe later
            </button>
          </div>
        </div>
      )}
    </>
  );
}
