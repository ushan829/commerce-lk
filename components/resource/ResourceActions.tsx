'use client'

import { useState } from 'react'
import { EyeIcon } from '@heroicons/react/24/outline'
import DownloadButton from './DownloadButton'
import BookmarkButton from './BookmarkButton'
import PDFPreviewModal from './PDFPreviewModal'

interface ResourceActionsProps {
  resource: {
    _id: string
    slug: string
    title: string
    fileUrl: string
    fileType: string
  }
  pageUrl: string
}

export default function ResourceActions({ resource, pageUrl }: ResourceActionsProps) {
  const [showPreview, setShowPreview] = useState(false)
  const isPDF = resource.fileType === 'pdf' || 
                resource.fileType === 'application/pdf' || 
                resource.fileUrl?.toLowerCase().endsWith('.pdf')

  return (
    <div className="space-y-4">
      <DownloadButton slug={resource.slug} title={resource.title} pageUrl={pageUrl} />
      
      {isPDF && (
        <button
          onClick={() => setShowPreview(true)}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-blue-600 text-blue-600 hover:bg-blue-50 rounded-xl font-medium transition-colors"
        >
          <EyeIcon className="w-5 h-5" />
          Preview
        </button>
      )}

      <BookmarkButton resourceId={resource._id} />

      <PDFPreviewModal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        fileUrl={resource.fileUrl}
        title={resource.title}
      />
    </div>
  )
}
