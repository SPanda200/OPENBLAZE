let electron = require("electron");
//#region electron/preload.ts
electron.contextBridge.exposeInMainWorld("electron", {
	selectVaultFolder: () => electron.ipcRenderer.invoke("vault:select-folder"),
	listEntries: (vaultPath, moduleFolder) => electron.ipcRenderer.invoke("vault:list-entries", vaultPath, moduleFolder),
	readEntry: (vaultPath, moduleFolder, fileName) => electron.ipcRenderer.invoke("vault:read-entry", vaultPath, moduleFolder, fileName),
	writeEntry: (vaultPath, moduleFolder, fileName, data, content) => electron.ipcRenderer.invoke("vault:write-entry", vaultPath, moduleFolder, fileName, data, content)
});
//#endregion
