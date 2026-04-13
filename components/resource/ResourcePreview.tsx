"use client";

import { useState, useEffect, useRef } from "react";
import {
  EyeIcon,
  XMarkIcon,
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";

interface Props {
  fileKey: string;
  fileType?: string;
  title: string;
}

const TIMEOUT_MS = 10_000;

export default function ResourcePreview({ fileKey, fileType, title }: Props) {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const publicUrl = `https://files.commerce.lk/${fileKey}`;
  const isPdf = !fileType || fileType.includes("pdf");
  const isImage = fileType?.startsWith("image/");

  useEffect(() => {
    if (loading) {
      timeoutRef.current = setTimeout(() => {
        setLoading(false);
        setTimedOut(true);
      }, TIMEOUT_MS);
    }
    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
  }, [loading]);

  function handleOpen() {
    setOpen(true);
    setLoading(true);
    setTimedOut(false);
  }

  function handleClose() {
    setOpen(false);
    setExpanded(false);
    setLoading(false);
    setTimedOut(false);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  }

  function handleLoaded() {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setLoading(false);
    setTimedOut(false);
  }

  function handleRetry() {
    setTimedOut(false);
    setLoading(true);
  }

  return (
    <>
      {/* Preview Button */}
      <button
        onClick={handleOpen}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-emerald-500 text-emerald-700 font-semibold text-sm hover:bg-emerald-50 transition-all duration-200"
      >
        <EyeIcon className="w-4 h-4" />
        Preview
      </button>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={handleClose} />

          {/* Panel */}
          <div
            className={`relative bg-white rounded-2xl shadow-2xl flex flex-col transition-all duration-200 ${
              expanded ? "w-full h-full rounded-none" : "w-full max-w-4xl"
            }`}
            style={expanded ? {} : { height: "85vh" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 bg-emerald-50 rounded-xl flex items-center justify-center shrink-0">
                  <EyeIcon className="w-4 h-4 text-blue-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Preview</p>
                  <p className="text-sm font-semibold text-gray-800 truncate">{title}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setExpanded(!expanded)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                  title={expanded ? "Collapse" : "Expand"}
                >
                  {expanded
                    ? <ArrowsPointingInIcon className="w-5 h-5" />
                    : <ArrowsPointingOutIcon className="w-5 h-5" />}
                </button>
                <button
                  onClick={handleClose}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                  title="Close"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden rounded-b-2xl bg-gray-100 relative">

              {/* Loading overlay */}
              {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10 pointer-events-none">
                  <div className="flex flex-col items-center gap-3 text-gray-400">
                    <div className="w-10 h-10 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm">Loading preview…</p>
                  </div>
                </div>
              )}

              {/* Timeout state */}
              {timedOut && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
                  <div className="flex flex-col items-center gap-3 text-center px-6">
                    <ExclamationTriangleIcon className="w-10 h-10 text-yellow-500" />
                    <p className="font-semibold text-gray-700">Preview is taking longer than expected</p>
                    <p className="text-sm text-gray-500">The file may be large. Try opening it directly.</p>
                    <div className="flex flex-wrap justify-center gap-3 mt-1">
                      <button
                        onClick={handleRetry}
                        className="btn-primary py-2 px-4 text-sm flex items-center gap-1.5"
                      >
                        <ArrowPathIcon className="w-4 h-4" /> Retry
                      </button>
                      <a
                        href={publicUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-secondary py-2 px-4 text-sm"
                      >
                        Open in new tab
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {/* PDF */}
              {isPdf && (
                <iframe
                  key={open ? "open" : "closed"}
                  src={publicUrl}
                  title={`Preview: ${title}`}
                  width="100%"
                  height="100%"
                  className="border-0 w-full h-full"
                  onLoad={handleLoaded}
                />
              )}

              {/* Image */}
              {isImage && (
                <div className="w-full h-full flex items-center justify-center p-4 overflow-auto">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={publicUrl}
                    alt={`Preview: ${title}`}
                    className="max-w-full max-h-full object-contain rounded-lg shadow"
                    onLoad={handleLoaded}
                  />
                </div>
              )}

              {/* Unsupported */}
              {!isPdf && !isImage && (
                <div className="flex flex-col items-center justify-center h-full gap-4 text-gray-400">
                  <EyeIcon className="w-12 h-12 opacity-30" />
                  <p className="font-medium">Preview not available for this file type</p>
                  <p className="text-sm">{fileType}</p>
                  <a
                    href={publicUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary py-2 px-4 text-sm"
                  >
                    Open in new tab
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
