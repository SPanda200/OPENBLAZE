// src/hooks/useManuscriptData.ts
import { useCallback, useEffect, useState } from 'react'
import { useVault } from '../context/VaultContext'
import type { Chapter, ChapterData } from '../types/chapter'

const MODULE_FOLDER = 'Manuscript'

export function useManuscriptData() {
  const { vaultPath } = useVault()
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [loading, setLoading] = useState(false)

  const refresh = useCallback(async () => {
    if (!vaultPath) return
    setLoading(true)
    const fileNames = await window.electron.listEntries(vaultPath, MODULE_FOLDER)
    const loaded = await Promise.all(fileNames.map((fn) => window.electron.readEntry(vaultPath, MODULE_FOLDER, fn)))
    const normalized = (loaded as any[]).map((c) => ({ ...c, data: { order: 0, mode: 'markdown', ...c.data } })) as Chapter[]
    normalized.sort((a, b) => a.data.order - b.data.order)
    setChapters(normalized)
    setLoading(false)
  }, [vaultPath])

  useEffect(() => { refresh() }, [refresh])

  const saveChapter = useCallback(async (fileName: string, data: ChapterData, content: string) => {
    if (!vaultPath) return
    await window.electron.writeEntry(vaultPath, MODULE_FOLDER, fileName, data, content)
    await refresh()
  }, [vaultPath, refresh])

  const createChapter = useCallback(async (): Promise<Chapter> => {
    const id = `chapter_${Date.now()}`
    const fileName = `${id}.md`
    const order = chapters.length > 0 ? Math.max(...chapters.map((c) => c.data.order)) + 1 : 0
    const data: ChapterData = { id, title: `Chapter ${chapters.length + 1}`, order, mode: 'markdown' }
    await saveChapter(fileName, data, '')
    return { data, content: '', fileName }
  }, [chapters, saveChapter])

  const deleteChapter = useCallback(async (fileName: string) => {
    if (!vaultPath) return { success: false, error: 'No vault open.' }
    const result = await window.electron.deleteEntry(vaultPath, MODULE_FOLDER, fileName)
    if (result.success) await refresh()
    return result
  }, [vaultPath, refresh])

  const reorderChapter = useCallback(async (fileName: string, direction: 'up' | 'down') => {
    const index = chapters.findIndex((c) => c.fileName === fileName)
    if (index === -1) return
    const swapIndex = direction === 'up' ? index - 1 : index + 1
    if (swapIndex < 0 || swapIndex >= chapters.length) return

    const current = chapters[index]
    const swapWith = chapters[swapIndex]
    await window.electron.writeEntry(vaultPath!, MODULE_FOLDER, current.fileName, { ...current.data, order: swapWith.data.order }, current.content)
    await window.electron.writeEntry(vaultPath!, MODULE_FOLDER, swapWith.fileName, { ...swapWith.data, order: current.data.order }, swapWith.content)
    await refresh()
  }, [chapters, vaultPath, refresh])

  return { chapters, loading, refresh, saveChapter, createChapter, deleteChapter, reorderChapter }
}