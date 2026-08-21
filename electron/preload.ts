// electron/preload.ts
import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electron', {
  selectVaultFolder: (): Promise<string | null> =>
    ipcRenderer.invoke('vault:select-folder'),

  listEntries: (vaultPath: string, moduleFolder: string): Promise<string[]> =>
    ipcRenderer.invoke('vault:list-entries', vaultPath, moduleFolder),

  readEntry: (vaultPath: string, moduleFolder: string, fileName: string) =>
    ipcRenderer.invoke('vault:read-entry', vaultPath, moduleFolder, fileName),

  writeEntry: (vaultPath: string, moduleFolder: string, fileName: string, data: object, content: string) =>
    ipcRenderer.invoke('vault:write-entry', vaultPath, moduleFolder, fileName, data, content),
})