"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { event } from '@/lib/gtag';
import {
  ArrowDownTrayIcon,
  CheckCircleIcon,
  XMarkIcon,
  ClipboardDocumentIcon,
  ClipboardDocumentCheckIcon,
  UserPlusIcon,
  BookmarkIcon,
} from "@heroicons/react/24/outline";

// ── Inline SVG icons for WhatsApp & Telegram ────────────────────────────────
function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function TelegramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
    </svg>
  );
}

// ── Types ────────────────────────────────────────────────────────────────────
interface Props {
  slug: string;
  title: string;
  pageUrl: string;
}

// ── Component ────────────────────────────────────────────────────────────────
export default function DownloadButton({ slug, title, pageUrl }: Props) {
  const { data: session } = useSession();
  const isLoggedIn = !!session?.user;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);       // download succeeded
  const [saved, setSaved] = useState(false);      // recorded to history
  const [copied, setCopied] = useState(false);
  const [showGuestBanner, setShowGuestBanner] = useState(false);

  const shareText = `📚 Check out this resource on Commerce.lk!\n\n${title}\n`;
  const waUrl = `https://wa.me/?text=${encodeURIComponent(shareText + pageUrl)}`;
  const tgUrl = `https://t.me/share/url?url=${encodeURIComponent(pageUrl)}&text=${encodeURIComponent(shareText)}`;

  async function handleDownload() {
    setLoading(true);
    setError("");
    try {
      event({ action: 'download', category: 'Resource', label: title });
      const res = await fetch(`/api/resources/${slug}/download`);
      const data = await res.json();
      if (!data.downloadUrl) throw new Error("Failed to generate download link.");
      window.open(data.downloadUrl, "_blank");
      setDone(true);

      if (isLoggedIn) {
        // Record to history — fire and forget
        fetch("/api/user/downloads", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ resourceSlug: slug }),
        }).then(() => setSaved(true)).catch(() => {});
      } else {
        setShowGuestBanner(true);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Download failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(pageUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // fallback: select input
    }
  }

  return (
    <div className="w-full space-y-4">
      {/* ── Download button ── */}
      {!done ? (
        <button
          onClick={handleDownload}
          disabled={loading}
          className="btn-primary w-full text-base py-4 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Preparing Download...
            </>
          ) : (
            <>
              <ArrowDownTrayIcon className="w-5 h-5" />
              Download Now (Free)
            </>
          )}
        </button>
      ) : (
        <div className="flex items-center gap-2 px-4 py-3 bg-green-50 border border-green-200 rounded-xl">
          <CheckCircleIcon className="w-5 h-5 text-green-600 shrink-0" />
          <span className="text-sm font-medium text-green-700">Download started!</span>
          {saved && (
            <span className="ml-auto flex items-center gap-1 text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
              <BookmarkIcon className="w-3.5 h-3.5" />
              Saved to history
            </span>
          )}
        </div>
      )}

      {error && <p className="text-sm text-red-500 text-center">{error}</p>}

      {/* ── Post-download: LOGGED-IN — share panel ── */}
      {done && isLoggedIn && (
        <div className="border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
            <p className="text-sm font-semibold text-gray-700">Share with friends</p>
            <p className="text-xs text-gray-400 mt-0.5">Help a classmate find this resource</p>
          </div>
          <div className="p-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-semibold text-sm transition-colors"
              >
                <WhatsAppIcon className="w-4 h-4" />
                WhatsApp
              </a>
              <a
                href={tgUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-[#229ED9] hover:bg-[#1a8ec5] text-white font-semibold text-sm transition-colors"
              >
                <TelegramIcon className="w-4 h-4" />
                Telegram
              </a>
            </div>
            {/* Copy link */}
            <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-xl border border-gray-200">
              <span className="flex-1 text-xs text-gray-500 truncate">{pageUrl}</span>
              <button
                onClick={handleCopy}
                className="shrink-0 flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700 px-2 py-1 rounded hover:bg-blue-50 transition-colors"
              >
                {copied
                  ? <><ClipboardDocumentCheckIcon className="w-4 h-4 text-green-500" /> Copied!</>
                  : <><ClipboardDocumentIcon className="w-4 h-4" /> Copy</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Post-download: GUEST — soft upsell banner ── */}
      {showGuestBanner && !isLoggedIn && (
        <div className="relative border border-blue-200 bg-blue-50 rounded-xl p-4">
          <button
            onClick={() => setShowGuestBanner(false)}
            aria-label="Close"
            className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
          <div className="flex gap-3">
            <div className="w-9 h-9 bg-emerald-50 rounded-xl flex items-center justify-center shrink-0">
              <UserPlusIcon className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-blue-800">
                Create a free account to unlock more
              </p>
              <ul className="text-xs text-blue-700 mt-1 space-y-0.5 list-none">
                <li>📥 Save your download history</li>
                <li>🔖 Bookmark resources for later</li>
                <li>📤 Share instantly via WhatsApp & Telegram</li>
              </ul>
              <div className="flex gap-2 mt-3">
                <Link
                  href="/register"
                  className="inline-flex items-center gap-1 text-xs font-semibold bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1.5 rounded-full transition-colors"
                >
                  <UserPlusIcon className="w-3.5 h-3.5" />
                  Sign up free
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center text-xs font-medium text-blue-600 hover:underline px-2 py-1.5"
                >
                  Already have an account? Sign in
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
