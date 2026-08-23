// src/hooks/useEntityData.ts
import { useCallback, useEffect, useState } from 'react'
import { useVault } from '../context/VaultContext'
import type { Entity, EntityData } from '../types/entity'
import type { Panel } from '../types/panel'

export function useEntityData(moduleFolder: string) {
  const { vaultPath } = useVault()
  const [entities, setEntities] = useState<Entity[]>([])
  const [loading, setLoading] = useState(false)

  const refresh = useCallback(async () => {
    if (!vaultPath) return
    setLoading(true)
    const fileNames = await window.electron.listEntries(vaultPath, moduleFolder)
    const loaded = await Promise.all(
      fileNames.map((fn) => window.electron.readEntry(vaultPath, moduleFolder, fn))
    )
    // Guard against older files saved before the panel system existed
    const normalized = (loaded as any[]).map((e) => ({
      ...e,
      data: { panels: [], ...e.data },
    })) as Entity[]
    normalized.sort((a, b) => (a.data.name || '').localeCompare(b.data.name || ''))
    setEntities(normalized)
    setLoading(false)
  }, [vaultPath, moduleFolder])

  useEffect(() => {
    refresh()
  }, [refresh])

  const saveEntity = useCallback(
    async (fileName: string, data: EntityData, content: string) => {
      if (!vaultPath) return
      await window.electron.writeEntry(vaultPath, moduleFolder, fileName, data, content)
      await refresh()
    },
    [vaultPath, moduleFolder, refresh]
  )

  const createEntity = useCallback(
    async (defaultPanels: Panel[], extra: Partial<EntityData> = {}): Promise<Entity> => {
      const id = `${moduleFolder.toLowerCase()}_${Date.now()}`
      const fileName = `${id}.md`
      const data: EntityData = { id, name: 'New Entry', panels: defaultPanels, ...extra }
      await saveEntity(fileName, data, '')
      return { data, content: '', fileName }
    },
    [moduleFolder, saveEntity]
  )

  const deleteEntity = useCallback(
    async (fileName: string) => {
      if (!vaultPath) return
      await window.electron.deleteEntry(vaultPath, moduleFolder, fileName)
      await refresh()
    },
    [vaultPath, moduleFolder, refresh]
  )

  return { entities, loading, refresh, saveEntity, createEntity, deleteEntity }
}