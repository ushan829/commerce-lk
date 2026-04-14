'use client'

import { useEffect } from 'react'
import { event } from '@/lib/gtag'

export default function ResourcePageViewTracker({ title }: { title: string }) {
  useEffect(() => {
    event({
      action: 'page_view',
      category: 'Resource',
      label: title,
    })
  }, [title])

  return null
}
