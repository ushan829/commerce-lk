"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

interface Ad {
  _id: string;
  title: string;
  type: string;
  imageUrl?: string;
  linkUrl?: string;
  altText?: string;
  htmlContent?: string;
}

interface BannerAdProps {
  position: string;
  subject?: string;
  category?: string;
  medium?: string;
  className?: string;
}

export default function BannerAd({
  position,
  subject,
  category,
  medium,
  className = "",
}: BannerAdProps) {
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
          setAds(ads.filter((a: Ad) => a.type === "banner"));
          // Track impressions
          ads.forEach((ad: Ad) => {
            fetch(`/api/ads/${ad._id}/track`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ type: "impression" }),
            });
          });
        }
      })
      .catch(() => {});
  }, [position, subject, category, medium]);

  if (!ads.length) return null;

  const ad = ads[0];

  const handleClick = () => {
    fetch(`/api/ads/${ad._id}/track`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "click" }),
    });
  };

  if (ad.htmlContent) {
    return (
      <div
        className={`w-full overflow-hidden ${className}`}
        dangerouslySetInnerHTML={{ __html: ad.htmlContent }}
      />
    );
  }

  if (!ad.imageUrl) return null;

  return (
    <a
      href={ad.linkUrl || "#"}
      target="_blank"
      rel="noopener noreferrer nofollow"
      onClick={handleClick}
      className={`block w-full overflow-hidden rounded-2xl ${className}`}
      aria-label={ad.altText || ad.title}
    >
      <div className="relative w-full h-[90px] sm:h-[90px]">
        <Image
          src={ad.imageUrl}
          alt={ad.altText || ad.title}
          fill
          className="object-contain"
          unoptimized
        />
      </div>
      <p className="text-xs text-center text-gray-400 mt-0.5">Advertisement</p>
    </a>
  );
}
