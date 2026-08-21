// src/context/VaultContext.tsx
import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'

interface VaultContextValue {
  vaultPath: string | null
  selectVault: () => Promise<void>
  clearVault: () => void
}

const VaultContext = createContext<VaultContextValue | undefined>(undefined)

const STORAGE_KEY = 'openblaze:lastVaultPath'

export function VaultProvider({ children }: { children: ReactNode }) {
  const [vaultPath, setVaultPath] = useState<string | null>(null)

  // Restore the last-used vault path on launch
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) setVaultPath(saved)
  }, [])

  const selectVault = async () => {
    const folder = await window.electron.selectVaultFolder()
    if (folder) {
      setVaultPath(folder)
      localStorage.setItem(STORAGE_KEY, folder)
    }
  }

  const clearVault = () => {
    setVaultPath(null)
    localStorage.removeItem(STORAGE_KEY)
  }

  return (
    <VaultContext.Provider value={{ vaultPath, selectVault, clearVault }}>
      {children}
    </VaultContext.Provider>
  )
}

export function useVault() {
  const ctx = useContext(VaultContext)
  if (!ctx) throw new Error('useVault must be used within a VaultProvider')
  return ctx
}