export type Bookmark = {
  id: string
  title: string
  url: string
  user_id: string
  created_at: string
}

export type NewBookmark = {
  title: string
  url: string
  user_id: string
}