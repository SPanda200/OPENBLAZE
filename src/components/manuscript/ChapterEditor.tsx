// src/components/manuscript/ChapterEditor.tsx
import { useEffect, useRef, useState } from 'react'
import { Save, Trash2, FileText, Code2 } from 'lucide-react'
import type { Chapter, ChapterData } from '../../types/chapter'
import { useUnsavedChanges } from '../../context/UnsavedChangesContext'
import { useNavigation } from '../../context/NavigationContext'
import { useEntityRegistry } from '../../context/EntityRegistryContext'
import { useLinkableTextarea } from '../../hooks/useLinkableTextarea'
import { LinkedText } from '../shared/LinkedText'
import { MarkdownRenderer } from './MarkdownRenderer'
import { EntityPicker } from '../panels/EntityPicker'
import { ExportMenu, type ExportFormat } from '../shared/ExportMenu'
import { exportAsText, exportAsDocx } from '../../hooks/useExport'
import { chapterToMarkdown, chapterToPlainText, chapterToBlocks } from '../../utils/exportBuilders'
import { countWords } from '../../utils/wordCount'

interface ChapterEditorProps {
  chapter: Chapter
  onSave: (fileName: string, data: ChapterData, content: string) => Promise<void>
  onDelete: () => void
}

export function ChapterEditor({ chapter, onSave, onDelete }: ChapterEditorProps) {
  const [title, setTitle] = useState(chapter.data.title ?? '')
  const [mode, setMode] = useState<'markdown' | 'plaintext'>(chapter.data.mode ?? 'markdown')
  const [content, setContent] = useState(chapter.content)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)

  const { setDirty, registerHandlers } = useUnsavedChanges()
  const { navigateToEntity } = useNavigation()
  const { entities } = useEntityRegistry()

  const initialSnapshot = useRef(JSON.stringify({ title: chapter.data.title ?? '', mode: chapter.data.mode ?? 'markdown', content: chapter.content }))

  const { textareaRef, pickerOpen, pickerQuery, highlightedIndex, anchorRect, handleChange, handleKeyDown, insertLink, closePicker } =
    useLinkableTextarea({ value: content, onChange: setContent })

  const buildData = (): ChapterData => ({ id: chapter.data.id, title: title.trim() || 'Untitled Chapter', order: chapter.data.order, mode })

  const handleSave = async () => {
    setSaving(true)
    await onSave(chapter.fileName, buildData(), content)
    setSaving(false)
    initialSnapshot.current = JSON.stringify({ title, mode, content })
    setDirty(false)
  }

  const handleExport = async (format: ExportFormat) => {
    const exportChapter = { ...chapter, data: buildData(), content }
    const safeTitle = title.trim() || 'Untitled Chapter'
    if (format === 'md') await exportAsText(`${safeTitle}.md`, 'md', chapterToMarkdown(exportChapter))
    else if (format === 'txt') await exportAsText(`${safeTitle}.txt`, 'txt', chapterToPlainText(exportChapter))
    else await exportAsDocx(`${safeTitle}.docx`, chapterToBlocks(exportChapter))
  }

  useEffect(() => {
    setDirty(JSON.stringify({ title, mode, content }) !== initialSnapshot.current)
  }, [title, mode, content, setDirty])

  useEffect(() => {
    registerHandlers({ onSave: handleSave })
    return () => registerHandlers(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, mode, content])

  return (
    <div className="max-w-3xl mx-auto space-y-4 pb-16">
      <div className="flex items-start justify-between gap-4">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Chapter title"
          className="text-2xl font-semibold bg-transparent border-b border-transparent focus:border-neutral-700 outline-none w-full text-neutral-100"
        />
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white rounded-md px-4 py-2 text-sm">
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save'}
          </button>
          <button onClick={onDelete} className="text-neutral-600 hover:text-red-500 p-2" title="Delete chapter">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-1 bg-neutral-900 border border-neutral-800 rounded-md p-1 w-fit">
        <button onClick={() => setMode('markdown')} className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs ${mode === 'markdown' ? 'bg-orange-600/20 text-orange-400' : 'text-neutral-500 hover:text-neutral-300'}`}>
          <Code2 className="w-3.5 h-3.5" /> Markdown
        </button>
        <button onClick={() => setMode('plaintext')} className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs ${mode === 'plaintext' ? 'bg-orange-600/20 text-orange-400' : 'text-neutral-500 hover:text-neutral-300'}`}>
          <FileText className="w-3.5 h-3.5" /> Plain Text
        </button>
      </div>

      {!editing ? (
        <div onClick={() => setEditing(true)} className="min-h-[50vh] cursor-text bg-neutral-900/40 border border-neutral-800 rounded-lg p-5">
          {content ? (
            mode === 'markdown' ? (
              <MarkdownRenderer text={content} />
            ) : (
              <div className="text-sm text-neutral-300 leading-relaxed whitespace-pre-wrap">
                <LinkedText text={content} entities={entities} onLinkClick={navigateToEntity} />
              </div>
            )
          ) : (
            <span className="text-neutral-600 text-sm">Click to start writing — use @ to link a character, location, or other entry.</span>
          )}
        </div>
      ) : (
        <div className="relative">
          <textarea
            ref={textareaRef}
            autoFocus
            value={content}
            onChange={(e) => handleChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={() => { setEditing(false); closePicker() }}
            placeholder={mode === 'markdown' ? 'Write in Markdown — # headings, **bold**, *italic*, lists, > quotes...' : 'Write freely — plain text, no formatting.'}
            rows={24}
            className="w-full min-h-[50vh] bg-neutral-900/40 border border-neutral-800 rounded-lg p-5 text-sm text-neutral-200 placeholder-neutral-600 outline-none focus:border-orange-600 resize-y leading-relaxed font-mono"
          />
          {pickerOpen && <EntityPicker query={pickerQuery} highlightedIndex={highlightedIndex} onSelect={insertLink} anchorRect={anchorRect} />}
        </div>
      )}
    </div>
  )
}