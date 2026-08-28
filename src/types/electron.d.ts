// src/types/electron.d.ts
import type { ExportBlock } from './export'

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
  exportText: (defaultFileName: string, extension: string, content: string) => Promise<{ success: boolean; canceled?: boolean; filePath?: string; error?: string }>
  exportDocx: (defaultFileName: string, blocks: ExportBlock[]) => Promise<{ success: boolean; canceled?: boolean; filePath?: string; error?: string }>
  createVaultFolder: (parentPath: string, folderName: string) => Promise<string | null>
  readConfig: (vaultPath: string, key: string) => Promise<any | null>
  writeConfig: (vaultPath: string, key: string, data: unknown) => Promise<boolean>
  importImage: (vaultPath: string) => Promise<{ success: boolean; relativePath?: string; error?: string } | null>
  importImageFromPath: (vaultPath: string, sourcePath: string) => Promise<{ success: boolean; relativePath?: string; error?: string }>
  getAssetUrl: (vaultPath: string, relativePath: string) => Promise<string>
  onBeforeClose: (callback: () => void) => () => void
  confirmClose: () => void
}

declare global {
  interface Window {
    electron: ElectronAPI
  }
}