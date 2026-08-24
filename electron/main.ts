// electron/main.ts
import { app, BrowserWindow, ipcMain, dialog } from 'electron'
import path from 'node:path'
import fs from 'node:fs/promises'
import matter from 'gray-matter'
import { fileURLToPath } from 'node:url'

// ESM has no __dirname — reconstruct it from import.meta.url
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

let mainWindow: BrowserWindow | null = null
let allowClose = false // set true only after the renderer confirms it's safe to close

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 900,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  mainWindow.maximize()

  // Intercept close attempts — ask the renderer first instead of closing immediately
  mainWindow.on('close', (event) => {
    if (!allowClose) {
      event.preventDefault()
      mainWindow?.webContents.send('app:before-close')
    }
  })

  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL)
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }
}

// electron/main.ts — add above your IPC handlers
function stripUndefined<T extends Record<string, any>>(obj: T): Partial<T> {
  const clean: Partial<T> = {}
  for (const key in obj) {
    if (obj[key] !== undefined) {
      clean[key] = obj[key]
    }
  }
  return clean
}


// Renderer calls this once it's confirmed there's nothing unsaved (or user chose to discard)
ipcMain.on('app:confirm-close', () => {
  allowClose = true
  mainWindow?.close()
})



// --- IPC: pick a project folder (the "vault") ---
ipcMain.handle('vault:select-folder', async () => {
  const result = await dialog.showOpenDialog({ properties: ['openDirectory'] })
  if (result.canceled || result.filePaths.length === 0) return null
  return result.filePaths[0]
})

// --- IPC: list .md files in a subfolder (e.g. "Characters", "Locations") ---
ipcMain.handle('vault:list-entries', async (_event, vaultPath: string, moduleFolder: string) => {
  const dirPath = path.join(vaultPath, moduleFolder)
  try {
    await fs.mkdir(dirPath, { recursive: true }) // safe: create if missing
    const files = await fs.readdir(dirPath)
    return files.filter(f => f.endsWith('.md'))
  } catch (err) {
    console.error('list-entries failed:', err)
    return []
  }
})

// --- IPC: read + parse a single .md file (YAML frontmatter + body) ---
ipcMain.handle('vault:read-entry', async (_event, vaultPath: string, moduleFolder: string, fileName: string) => {
  const filePath = path.join(vaultPath, moduleFolder, fileName)
  try {
    const raw = await fs.readFile(filePath, 'utf-8')
    const parsed = matter(raw) // { data: {...yaml}, content: "body text" }
    return { data: parsed.data ?? {}, content: parsed.content ?? '', fileName }
  } catch (err) {
    console.error('read-entry failed:', err)
    // Safe fallback per protocol — never throw a crashing error to the renderer
    return { data: {}, content: '', fileName }
  }
})

// --- IPC: write (create/update) a .md file from YAML data + body ---
ipcMain.handle(
  'vault:write-entry',
  async (_event, vaultPath: string, moduleFolder: string, fileName: string, data: object, content: string) => {
    const dirPath = path.join(vaultPath, moduleFolder)
    await fs.mkdir(dirPath, { recursive: true })
    const filePath = path.join(dirPath, fileName)
    const cleanData = stripUndefined(data as Record<string, any>) // <-- strip undefined before serializing
    const fileString = matter.stringify(content ?? '', cleanData)
    await fs.writeFile(filePath, fileString, 'utf-8')
    return true
  }
)

// electron/main.ts — add below vault:write-entry
ipcMain.handle('vault:delete-entry', async (_event, vaultPath: string, moduleFolder: string, fileName: string) => {
  const filePath = path.join(vaultPath, moduleFolder, fileName)
  try {
    await fs.unlink(filePath)
    return { success: true }
  } catch (err) {
    console.error('delete-entry failed:', err)
    return { success: false, error: (err as Error).message }
  }
})

// electron/main.ts — add below your other handlers
ipcMain.handle('vault:create-folder', async (_event, parentPath: string, folderName: string) => {
  const newVaultPath = path.join(parentPath, folderName)
  try {
    // fails if it already exists — prevents silently overwriting an existing project
    await fs.mkdir(newVaultPath, { recursive: false })

    // Scaffold the standard module subfolders up front
    await fs.mkdir(path.join(newVaultPath, 'Characters'), { recursive: true })
    await fs.mkdir(path.join(newVaultPath, 'Locations'), { recursive: true })
    await fs.mkdir(path.join(newVaultPath, 'Manuscript'), { recursive: true })

    return newVaultPath
  } catch (err) {
    console.error('create-folder failed:', err)
    return null
  }
})

// --- NEW CONFIG HANDLERS ---
const CONFIG_DIR = '.openblaze'

ipcMain.handle('vault:read-config', async (_event, vaultPath: string, key: string) => {
  const filePath = path.join(vaultPath, CONFIG_DIR, `${key}.json`)
  try {
    const raw = await fs.readFile(filePath, 'utf-8')
    return JSON.parse(raw)
  } catch {
    return null // missing/corrupt — caller falls back to defaults
  }
})

ipcMain.handle('vault:write-config', async (_event, vaultPath: string, key: string, data: unknown) => {
  const dirPath = path.join(vaultPath, CONFIG_DIR)
  await fs.mkdir(dirPath, { recursive: true })
  await fs.writeFile(path.join(dirPath, `${key}.json`), JSON.stringify(data, null, 2), 'utf-8')
  return true
})

app.whenReady().then(createWindow)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})