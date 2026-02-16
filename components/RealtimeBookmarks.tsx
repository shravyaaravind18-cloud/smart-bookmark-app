'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Bookmark } from '@/lib/types/database'
import BookmarkItem from './BookmarkItem'

type RealtimeBookmarksProps = {
  initialBookmarks: Bookmark[]
  userId: string
}

export default function RealtimeBookmarks({ initialBookmarks, userId }: RealtimeBookmarksProps) {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(initialBookmarks)
  const supabase = createClient()

  useEffect(() => {
    // Reset bookmarks when initialBookmarks change (e.g., after server revalidation)
    setBookmarks(initialBookmarks)
  }, [initialBookmarks])

  useEffect(() => {
    // Subscribe to real-time changes
    const channel = supabase
      .channel('bookmarks-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'bookmarks',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const newBookmark = payload.new as Bookmark
          setBookmarks((current) => [newBookmark, ...current])
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'bookmarks',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const deletedBookmark = payload.old as Bookmark
          setBookmarks((current) => current.filter((b) => b.id !== deletedBookmark.id))
        }
      )
      .subscribe()

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, userId])

  if (bookmarks.length === 0) {
    return (
      <div className="text-center py-12 border border-dashed border-gray-300 rounded-lg">
        <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
        </svg>
        <p className="text-gray-500 font-medium">No bookmarks yet</p>
        <p className="text-sm text-gray-400 mt-1">Add your first bookmark above</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {bookmarks.map((bookmark) => (
        <BookmarkItem key={bookmark.id} bookmark={bookmark} />
      ))}
    </div>
  )
}