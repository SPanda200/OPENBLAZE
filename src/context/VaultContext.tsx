// src/context/VaultContext.tsx
import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'

interface VaultContextValue {
  vaultPath: string | null
  selectVault: () => Promise<void>
  createVault: (folderName: string) => Promise<{ success: boolean; error?: string }>
  clearVault: () => void
}

const VaultContext = createContext<VaultContextValue | undefined>(undefined)
const STORAGE_KEY = 'openblaze:lastVaultPath'

export function VaultProvider({ children }: { children: ReactNode }) {
  const [vaultPath, setVaultPath] = useState<string | null>(null)

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

  const createVault = async (folderName: string) => {
    const trimmed = folderName.trim()
    if (!trimmed) return { success: false, error: 'Project name cannot be empty.' }

    // Ask where the new project folder should live
    const parentPath = await window.electron.selectVaultFolder()
    if (!parentPath) return { success: false, error: 'No location selected.' }

    const newVaultPath = await window.electron.createVaultFolder(parentPath, trimmed)
    if (!newVaultPath) {
      return { success: false, error: 'A folder with that name may already exist there.' }
    }

    setVaultPath(newVaultPath)
    localStorage.setItem(STORAGE_KEY, newVaultPath)
    return { success: true }
  }

  const clearVault = () => {
    setVaultPath(null)
    localStorage.removeItem(STORAGE_KEY)
  }

  return (
    <VaultContext.Provider value={{ vaultPath, selectVault, createVault, clearVault }}>
      {children}
    </VaultContext.Provider>
  )
}

export function useVault() {
  const ctx = useContext(VaultContext)
  if (!ctx) throw new Error('useVault must be used within a VaultProvider')
  return ctx
}