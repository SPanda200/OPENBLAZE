// src/hooks/useLocationData.ts
import { useCallback, useEffect, useState } from 'react'
import { useVault } from '../context/VaultContext'
import type { Location, LocationData } from '../types/location'

const MODULE_FOLDER = 'Locations'

export function useLocationData() {
  const { vaultPath } = useVault()
  const [locations, setLocations] = useState<Location[]>([])
  const [loading, setLoading] = useState(false)

  const refresh = useCallback(async () => {
    if (!vaultPath) return
    setLoading(true)
    const fileNames = await window.electron.listEntries(vaultPath, MODULE_FOLDER)
    const loaded = await Promise.all(
      fileNames.map((fn) => window.electron.readEntry(vaultPath, MODULE_FOLDER, fn))
    )
    loaded.sort((a, b) => (a.data.name || '').localeCompare(b.data.name || ''))
    setLocations(loaded as Location[])
    setLoading(false)
  }, [vaultPath])

  useEffect(() => {
    refresh()
  }, [refresh])

  const saveLocation = useCallback(
    async (fileName: string, data: LocationData, content: string) => {
      if (!vaultPath) return
      await window.electron.writeEntry(vaultPath, MODULE_FOLDER, fileName, data, content)
      await refresh()
    },
    [vaultPath, refresh]
  )

  const createLocation = useCallback(
    async (parentId: string | null = null): Promise<Location> => {
      const id = `loc_${Date.now()}`
      const fileName = `${id}.md`
      const data: LocationData = { id, name: 'New Location', parentId, tags: [] }
      await saveLocation(fileName, data, '')
      return { data, content: '', fileName }
    },
    [saveLocation]
  )

  const deleteLocation = useCallback(
    async (fileName: string) => {
      if (!vaultPath) return
      await window.electron.deleteEntry(vaultPath, MODULE_FOLDER, fileName)
      await refresh()
    },
    [vaultPath, refresh]
  )

  return { locations, loading, refresh, saveLocation, createLocation, deleteLocation }
}