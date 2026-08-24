// src/components/manuscript/ManuscriptModule.tsx
import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useManuscriptData } from '../../hooks/useManuscriptData'
import { useUnsavedChanges } from '../../context/UnsavedChangesContext'
import { ChapterList } from './ChapterList'
import { ChapterEditor } from './ChapterEditor'

export function ManuscriptModule() {
  const { chapters, loading, createChapter, saveChapter, deleteChapter, reorderChapter } = useManuscriptData()
  const { guardNavigation } = useUnsavedChanges()
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null)

  const selected = chapters.find((c) => c.fileName === selectedFileName) ?? null

  const handleSelect = (fileName: string) => guardNavigation(() => setSelectedFileName(fileName))

  const handleCreate = () => guardNavigation(async () => {
    const created = await createChapter()
    setSelectedFileName(created.fileName)
  })

  const handleDelete = async (fileName: string, title: string) => {
    const confirmed = window.confirm(`Delete "${title}"? This cannot be undone.`)
    if (!confirmed) return
    const result = await deleteChapter(fileName)
    if (!result.success) { window.alert(`Couldn't delete: ${result.error ?? 'unknown error'}`); return }
    if (selectedFileName === fileName) setSelectedFileName(null)
  }

  return (
    <div className="flex h-full -m-6">
      <div className="w-64 shrink-0 border-r border-neutral-800 flex flex-col">
        <div className="p-3 border-b border-neutral-800">
          <button onClick={handleCreate} className="w-full flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 text-white rounded-md px-3 py-2 text-sm">
            <Plus className="w-4 h-4" />
            New Chapter
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {loading && <p className="text-sm text-neutral-500 p-4">Loading...</p>}
          {!loading && chapters.length === 0 && <p className="text-sm text-neutral-500 p-4">No chapters yet.</p>}
          <ChapterList chapters={chapters} selectedFileName={selectedFileName} onSelect={handleSelect} onReorder={reorderChapter} />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {selected ? (
          <ChapterEditor key={selected.fileName} chapter={selected} onSave={saveChapter} onDelete={() => handleDelete(selected.fileName, selected.data.title)} />
        ) : (
          <div className="flex items-center justify-center h-full text-neutral-600 text-sm">Select a chapter or create a new one.</div>
        )}
      </div>
    </div>
  )
}