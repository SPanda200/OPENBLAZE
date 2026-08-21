// src/hooks/useVaultData.ts
import { useCallback, useState } from 'react'
import type { VaultEntry } from '../types/electron'

export function useVaultData(vaultPath: string | null) {
  const [entries, setEntries] = useState<VaultEntry[]>([])
  const [loading, setLoading] = useState(false)

  const loadModule = useCallback(async (moduleFolder: string) => {
    if (!vaultPath) return
    setLoading(true)
    const fileNames = await window.electron.listEntries(vaultPath, moduleFolder)
    const loaded = await Promise.all(
      fileNames.map(fn => window.electron.readEntry(vaultPath, moduleFolder, fn))
    )
    setEntries(loaded)
    setLoading(false)
  }, [vaultPath])

  const saveEntry = useCallback(
    async (moduleFolder: string, fileName: string, data: object, content: string) => {
      if (!vaultPath) return
      await window.electron.writeEntry(vaultPath, moduleFolder, fileName, data, content)
    },
    [vaultPath]
  )

  return { entries, loading, loadModule, saveEntry }
}