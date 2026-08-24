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
  
  deleteEntry: (vaultPath: string, moduleFolder: string, fileName: string): Promise<{ success: boolean; error?: string }> =>
    ipcRenderer.invoke('vault:delete-entry', vaultPath, moduleFolder, fileName),
  
  createVaultFolder: (parentPath: string, folderName: string): Promise<string | null> =>
    ipcRenderer.invoke('vault:create-folder', parentPath, folderName),

  readConfig: (vaultPath: string, key: string) => 
    ipcRenderer.invoke('vault:read-config', vaultPath, key),
  
  writeConfig: (vaultPath: string, key: string, data: unknown) => 
    ipcRenderer.invoke('vault:write-config', vaultPath, key, data),

  // App lifecycle methods added here:
  onBeforeClose: (callback: () => void) => {
    const listener = () => callback()
    ipcRenderer.on('app:before-close', listener)
    return () => ipcRenderer.removeListener('app:before-close', listener)
  },
  
  confirmClose: () => ipcRenderer.send('app:confirm-close')
})