'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { XMarkIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline'

interface PDFPreviewModalProps {
  isOpen: boolean
  onClose: () => void
  fileUrl: string
  title: string
}

export default function PDFPreviewModal({ isOpen, onClose, fileUrl, title }: PDFPreviewModalProps) {
  const portalRef = useRef<Element | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    portalRef.current = document.body
    setMounted(true)
  }, [])

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      document.addEventListener('keydown', handleEsc)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleEsc)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen || !mounted || !portalRef.current) return null

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-4xl h-[90vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden">

        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white flex-shrink-0">
          <div className="flex-1 min-w-0 mr-4">
            <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Preview</p>
            <h3 className="text-gray-900 font-semibold truncate">{title}</h3>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <a
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
            >
              <ArrowTopRightOnSquareIcon className="w-4 h-4" />
              Open
            </a>
            <button
              onClick={onClose}
              aria-label="Close preview"
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PDF Viewer */}
        <div className="flex-1 overflow-hidden bg-gray-100">
          <iframe
            src={`${fileUrl}#toolbar=1&navpanes=0&scrollbar=1&view=FitH`}
            className="w-full h-full border-0"
            title={`Preview - ${title}`}
            loading="lazy"
          />
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-gray-100 bg-gray-50 flex-shrink-0">
          <p className="text-xs text-gray-500 text-center">
            Press <kbd className="px-1.5 py-0.5 bg-white border border-gray-200 rounded text-xs font-mono">ESC</kbd> or click outside to close • Download for the best experience
          </p>
        </div>
      </div>
    </div>,
    portalRef.current
  )
}
