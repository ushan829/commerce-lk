'use client'

import { useState, useEffect } from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'

interface Announcement {
  _id: string
  message: string
  type: 'info' | 'warning' | 'success' | 'error'
  link?: string
  linkText?: string
  dismissible: boolean
}

const typeStyles = {
  info: 'bg-blue-600 text-white',
  warning: 'bg-yellow-500 text-white',
  success: 'bg-green-600 text-white',
  error: 'bg-red-600 text-white',
}

export default function AnnouncementBanner() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [dismissed, setDismissed] = useState<string[]>([])

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const res = await fetch('/api/announcements')
        const data = await res.json()
        setAnnouncements(data.announcements || [])
      } catch (error) {
        console.error('Failed to fetch announcements:', error)
      }
    }
    fetchAnnouncements()

    // Load dismissed from sessionStorage
    const stored = sessionStorage.getItem('dismissed_announcements')
    if (stored) setDismissed(JSON.parse(stored))
  }, [])

  const handleDismiss = (id: string) => {
    const updated = [...dismissed, id]
    setDismissed(updated)
    sessionStorage.setItem('dismissed_announcements', JSON.stringify(updated))
  }

  const visible = announcements.filter(a => !dismissed.includes(a._id))
  if (visible.length === 0) return null

  return (
    <div className="w-full relative z-[40]">
      {visible.map((announcement) => (
        <div
          key={announcement._id}
          className={`${typeStyles[announcement.type]} px-4 py-2.5 flex items-center justify-center gap-3 text-sm font-medium border-b border-white/10`}
        >
          <div className="flex-1 text-center">
            {announcement.message}
            {announcement.link && (
              <Link
                href={announcement.link}
                className="ml-2 underline font-semibold hover:opacity-80 transition-opacity"
              >
                {announcement.linkText || 'Learn more'}
              </Link>
            )}
          </div>
          {announcement.dismissible && (
            <button
              onClick={() => handleDismiss(announcement._id)}
              aria-label="Dismiss announcement"
              className="flex-shrink-0 p-1 hover:bg-white/10 rounded-full transition-all"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          )}
        </div>
      ))}
    </div>
  )
}
