"use client"
import DOMPurify from 'isomorphic-dompurify'
import { useEffect, useState } from "react"

export default function AdBanner({ position }: { position: string }) {
  const [ad, setAd] = useState<any>(null)

  useEffect(() => {
    console.log("Fetching ad for position:", position)
    fetch(`/api/ads/display?position=${encodeURIComponent(position)}`)
      .then(r => r.json())
      .then(data => { 
        console.log("Ad received:", data)
        setAd(data.ad) 
      })
      .catch((err) => {
        console.error("Ad fetch error:", err)
      })
  }, [position])

  useEffect(() => {
    if (ad?._id) {
      fetch(`/api/ads/${ad._id}/impression`, { method: "POST" })
        .catch(() => {})
    }
  }, [ad?._id])

  if (!ad) return null

  const sanitizedHtml = DOMPurify.sanitize(ad.htmlCode || ad.htmlContent || '', {
    ALLOWED_TAGS: ['a', 'img', 'div', 'span', 'p', 'br', 'strong', 'em'],
    ALLOWED_ATTR: ['href', 'src', 'alt', 'class', 'style', 'target', 'rel'],
  })

  return (
    <div className="w-full my-4">
      <p className="text-xs text-gray-400 text-center mb-1">
        Advertisement
      </p>
      {ad.htmlCode || ad.htmlContent ? (
        <div dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />
      ) : ad.imageUrl ? (
        <a 
          href={ad.linkUrl || "#"}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => 
            fetch(`/api/ads/${ad._id}/click`, { method: "POST" })
              .catch(() => {})
          }
        >
          <img
            src={ad.imageUrl}
            alt={ad.title}
            className="w-full rounded-xl object-cover"
          />
        </a>
      ) : null}
    </div>
  )
}
