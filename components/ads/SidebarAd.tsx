"use client";

import DOMPurify from 'isomorphic-dompurify';
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

interface SidebarAdProps {
  position: string;
  subject?: string;
  category?: string;
  medium?: string;
}

export default function SidebarAd({
  position,
  subject,
  category,
  medium,
}: SidebarAdProps) {
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
          setAds(ads.filter((a: Ad) => a.type === "sidebar"));
        }
      })
      .catch(() => {});
  }, [position, subject, category, medium]);

  if (!ads.length) return null;

  return (
    <div className="space-y-4">
      {ads.map((ad) => {
        const handleClick = () => {
          fetch(`/api/ads/${ad._id}/track`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ type: "click" }),
          });
        };

        if (ad.htmlContent) {
          const sanitizedHtml = DOMPurify.sanitize(ad.htmlContent, {
            ALLOWED_TAGS: ['a', 'img', 'div', 'span', 'p', 'br', 'strong', 'em'],
            ALLOWED_ATTR: ['href', 'src', 'alt', 'class', 'style', 'target', 'rel'],
          })
          return (
            <div
              key={ad._id}
              className="card overflow-hidden"
              dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
            />
          );
        }

        if (!ad.imageUrl) return null;

        return (
          <a
            key={ad._id}
            href={ad.linkUrl || "#"}
            target="_blank"
            rel="noopener noreferrer nofollow"
            onClick={handleClick}
            className="card block overflow-hidden"
            aria-label={ad.altText || ad.title}
          >
            <div className="relative w-full aspect-[300/250]">
              <Image
                src={ad.imageUrl}
                alt={ad.altText || ad.title}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
            <p className="text-xs text-center text-gray-400 py-1">
              Advertisement
            </p>
          </a>
        );
      })}
    </div>
  );
}
