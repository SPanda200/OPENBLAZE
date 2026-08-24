// src/types/chapter.ts
export interface ChapterData {
  id: string
  title: string
  order: number
  mode: 'markdown' | 'plaintext'
}

export interface Chapter {
  data: ChapterData
  content: string
  fileName: string
}