'use client'

import { useState, useTransition } from 'react'
import { deleteBookmark } from '@/lib/actions/bookmarks'
import type { Bookmark } from '@/lib/types/database'

type BookmarkItemProps = {
  bookmark: Bookmark
}

export default function BookmarkItem({ bookmark }: BookmarkItemProps) {
  const [isDeleting, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const handleDelete = () => {
    if (!confirm('Are you sure you want to delete this bookmark?')) {
      return
    }

    setError(null)
    startTransition(async () => {
      const result = await deleteBookmark(bookmark.id)

      if (result.error) {
        setError(result.error)
      }
    })
  }

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-gray-900 truncate mb-1">
            {bookmark.title}
          </h3>
          <a
            href={bookmark.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-600 hover:text-blue-800 hover:underline truncate block"
          >
            {bookmark.url}
          </a>
          <p className="text-xs text-gray-500 mt-2">
            {new Date(bookmark.created_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>

        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="flex-shrink-0 text-red-600 hover:text-red-800 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Delete bookmark"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>

      {error && (
        <div className="mt-2 text-xs text-red-600">
          {error}
        </div>
      )}
    </div>
  )
}