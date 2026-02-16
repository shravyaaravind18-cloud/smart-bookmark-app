'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { NewBookmark } from '@/lib/types/database'

export async function addBookmark(formData: FormData) {
  const supabase = await createClient()

  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    return { error: 'Not authenticated' }
  }

  const title = formData.get('title') as string
  const url = formData.get('url') as string

  // Validation
  if (!title || !url) {
    return { error: 'Title and URL are required' }
  }

  // Validate URL format
  try {
    new URL(url)
  } catch {
    return { error: 'Invalid URL format' }
  }

  const newBookmark: NewBookmark = {
    title: title.trim(),
    url: url.trim(),
    user_id: user.id,
  }

  const { data, error } = await supabase
    .from('bookmarks')
    .insert(newBookmark)
    .select()
    .single()

  if (error) {
    console.error('Error adding bookmark:', error)
    return { error: 'Failed to add bookmark' }
  }

  revalidatePath('/')
  return { data, error: null }
}

export async function deleteBookmark(bookmarkId: string) {
  const supabase = await createClient()

  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    return { error: 'Not authenticated' }
  }

  const { error } = await supabase
    .from('bookmarks')
    .delete()
    .eq('id', bookmarkId)
    .eq('user_id', user.id) // Extra safety check

  if (error) {
    console.error('Error deleting bookmark:', error)
    return { error: 'Failed to delete bookmark' }
  }

  revalidatePath('/')
  return { error: null }
}