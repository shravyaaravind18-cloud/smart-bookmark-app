import { createClient } from '@/lib/supabase/server'
import type { Bookmark } from '@/lib/types/database'
import RealtimeBookmarks from './RealtimeBookmarks'

export default async function BookmarkList() {
  const supabase = await createClient()

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  // Fetch user's bookmarks
  const { data: bookmarks, error } = await supabase
    .from('bookmarks')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching bookmarks:', error)
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
        Failed to load bookmarks
      </div>
    )
  }

  return <RealtimeBookmarks initialBookmarks={bookmarks as Bookmark[]} userId={user.id} />
}