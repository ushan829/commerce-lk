"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";

interface Ad {
  _id: string;
  title: string;
  type: string;
  nativeTitle?: string;
  nativeDescription?: string;
  nativeImage?: string;
  linkUrl?: string;
}

interface NativeAdProps {
  position: string;
  subject?: string;
  category?: string;
  medium?: string;
}

export default function NativeAd({
  position,
  subject,
  category,
  medium,
}: NativeAdProps) {
  const [ads, setAds] = useState<Ad[]>([]);

  useEffect(() => {
    const params = new URLSearchParams({ position });
    if (subject) params.set("subject", subject);
    if (category) params.set("category", category);
    if (medium) params.set("medium", medium);

    fetch(`/api/ads?${params}`)
      .then((r) => r.json())
      .then(({ ads }) => {
        if (ads?.length) {
          setAds(ads.filter((a: Ad) => a.type === "native"));
        }
      })
      .catch(() => {});
  }, [position, subject, category, medium]);

  if (!ads.length) return null;

  return (
    <div className="space-y-3">
      {ads.map((ad) => {
        const handleClick = () => {
          fetch(`/api/ads/${ad._id}/track`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ type: "click" }),
          });
        };

        return (
          <a
            key={ad._id}
            href={ad.linkUrl || "#"}
            target="_blank"
            rel="noopener noreferrer nofollow"
            onClick={handleClick}
            className="flex items-center space-x-3 p-3 rounded-lg bg-accent-50 border border-accent-200 hover:bg-accent-100 transition-colors group"
          >
            {ad.nativeImage && (
              <div className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0">
                <Image
                  src={ad.nativeImage}
                  alt={ad.nativeTitle || ""}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-1.5 mb-0.5">
                <span className="badge bg-accent-200 text-accent-700 text-[10px]">
                  Sponsored
                </span>
              </div>
              <p className="font-semibold text-gray-900 text-sm truncate">
                {ad.nativeTitle || ad.title}
              </p>
              {ad.nativeDescription && (
                <p className="text-xs text-gray-500 line-clamp-2 mt-0.5">
                  {ad.nativeDescription}
                </p>
              )}
            </div>
            <ArrowTopRightOnSquareIcon className="w-4 h-4 text-gray-400 shrink-0 group-hover:text-blue-600 transition-colors" />
          </a>
        );
      })}
    </div>
  );
}
