// src/types/electron.d.ts
export interface VaultEntry {
  data: Record<string, any>
  content: string
  fileName: string
}

export interface ElectronAPI {
  selectVaultFolder: () => Promise<string | null>
  listEntries: (vaultPath: string, moduleFolder: string) => Promise<string[]>
  readEntry: (vaultPath: string, moduleFolder: string, fileName: string) => Promise<VaultEntry>
  writeEntry: (
    vaultPath: string,
    moduleFolder: string,
    fileName: string,
    data: object,
    content: string
  ) => Promise<boolean>
  deleteEntry: (vaultPath: string, moduleFolder: string, fileName: string) => Promise<{ success: boolean; error?: string }>
  createVaultFolder: (parentPath: string, folderName: string) => Promise<string | null>
  onBeforeClose: (callback: () => void) => () => void
  confirmClose: () => void
}

declare global {
  interface Window {
    electron: ElectronAPI
  }
}