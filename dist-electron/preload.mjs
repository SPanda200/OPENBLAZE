let electron = require("electron");
//#region electron/preload.ts
electron.contextBridge.exposeInMainWorld("electron", {
	selectVaultFolder: () => electron.ipcRenderer.invoke("vault:select-folder"),
	listEntries: (vaultPath, moduleFolder) => electron.ipcRenderer.invoke("vault:list-entries", vaultPath, moduleFolder),
	readEntry: (vaultPath, moduleFolder, fileName) => electron.ipcRenderer.invoke("vault:read-entry", vaultPath, moduleFolder, fileName),
	writeEntry: (vaultPath, moduleFolder, fileName, data, content) => electron.ipcRenderer.invoke("vault:write-entry", vaultPath, moduleFolder, fileName, data, content),
	deleteEntry: (vaultPath, moduleFolder, fileName) => electron.ipcRenderer.invoke("vault:delete-entry", vaultPath, moduleFolder, fileName),
	createVaultFolder: (parentPath, folderName) => electron.ipcRenderer.invoke("vault:create-folder", parentPath, folderName),
	readConfig: (vaultPath, key) => electron.ipcRenderer.invoke("vault:read-config", vaultPath, key),
	writeConfig: (vaultPath, key, data) => electron.ipcRenderer.invoke("vault:write-config", vaultPath, key, data),
	importImage: (vaultPath) => electron.ipcRenderer.invoke("vault:import-image-dialog", vaultPath),
	importImageFromPath: (vaultPath, sourcePath) => electron.ipcRenderer.invoke("vault:import-image-path", vaultPath, sourcePath),
	getAssetUrl: (vaultPath, relativePath) => electron.ipcRenderer.invoke("vault:get-asset-url", vaultPath, relativePath),
	onBeforeClose: (callback) => {
		const listener = () => callback();
		electron.ipcRenderer.on("app:before-close", listener);
		return () => electron.ipcRenderer.removeListener("app:before-close", listener);
	},
	confirmClose: () => electron.ipcRenderer.send("app:confirm-close")
});
//#endregion
