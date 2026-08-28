// src/components/manuscript/ChapterList.tsx
import { ChevronUp, ChevronDown, FileText } from 'lucide-react'
import type { Chapter } from '../../types/chapter'
import { countWords } from '../../utils/wordCount'

interface ChapterListProps {
  chapters: Chapter[]
  selectedFileName: string | null
  onSelect: (fileName: string) => void
  onReorder: (fileName: string, direction: 'up' | 'down') => void
}

export function ChapterList({ chapters, selectedFileName, onSelect, onReorder }: ChapterListProps) {
  return (
    <div>
      {chapters.map((chapter, index) => (
        <div key={chapter.fileName} className={`group flex items-center gap-1 pr-1 border-b border-neutral-800/50 ${chapter.fileName === selectedFileName ? 'bg-orange-600/10 text-orange-400' : 'text-neutral-300 hover:bg-neutral-800'}`}>
          <button onClick={() => onSelect(chapter.fileName)} className="flex-1 flex items-center gap-2 px-4 py-2.5 text-sm text-left min-w-0">
            <FileText className="w-3.5 h-3.5 shrink-0 opacity-60" />
            <span className="truncate">{chapter.data.title || 'Untitled'}</span>
            <span className="text-xs text-neutral-600 ml-auto shrink-0">{countWords(chapter.content)}w</span>
          </button>
          <div className="flex flex-col opacity-0 group-hover:opacity-100 shrink-0">
            <button onClick={() => onReorder(chapter.fileName, 'up')} disabled={index === 0} className="text-neutral-500 hover:text-orange-400 disabled:opacity-20 disabled:hover:text-neutral-500 p-0.5">
              <ChevronUp className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => onReorder(chapter.fileName, 'down')} disabled={index === chapters.length - 1} className="text-neutral-500 hover:text-orange-400 disabled:opacity-20 disabled:hover:text-neutral-500 p-0.5">
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}