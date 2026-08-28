// electron/main.ts
import { app, BrowserWindow, ipcMain, dialog, protocol, net } from 'electron'
import path from 'node:path'
import fs from 'node:fs/promises'
import matter from 'gray-matter'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { Document, Packer, Paragraph, HeadingLevel, TextRun } from 'docx'

// ESM has no __dirname — reconstruct it from import.meta.url
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

let mainWindow: BrowserWindow | null = null
let allowClose = false // set true only after the renderer confirms it's safe to close

// Must be registered before app is ready. This scheme is how the renderer
// safely loads local vault images, since raw file:// URLs get blocked when
// the app is served over http://localhost in dev.
protocol.registerSchemesAsPrivileged([
  { scheme: 'openblaze-asset', privileges: { standard: true, secure: true, supportFetchAPI: true, stream: true, bypassCSP: true, corsEnabled: true } },
])

function registerAssetProtocol() {
  protocol.handle('openblaze-asset', (request) => {
    const url = new URL(request.url)
    const encodedPath = url.pathname.replace(/^\//, '')
    const filePath = decodeURIComponent(encodedPath)
    return net.fetch(pathToFileURL(filePath).href)
  })
}

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

interface ExportBlock { type: 'h1' | 'h2' | 'p' | 'bullet' | 'pageBreak'; text?: string }

ipcMain.handle('export:save-text', async (_event, defaultFileName: string, extension: string, content: string) => {
  const result = await dialog.showSaveDialog({
    defaultPath: defaultFileName,
    filters: [{ name: extension.toUpperCase(), extensions: [extension] }],
  })
  if (result.canceled || !result.filePath) return { success: false, canceled: true }
  try {
    await fs.writeFile(result.filePath, content, 'utf-8')
    return { success: true, filePath: result.filePath }
  } catch (err) {
    console.error('export-text failed:', err)
    return { success: false, error: (err as Error).message }
  }
})

ipcMain.handle('export:save-docx', async (_event, defaultFileName: string, blocks: ExportBlock[]) => {
  const result = await dialog.showSaveDialog({
    defaultPath: defaultFileName,
    filters: [{ name: 'Word Document', extensions: ['docx'] }],
  })
  if (result.canceled || !result.filePath) return { success: false, canceled: true }

  try {
    const children = blocks.map((block) => {
      if (block.type === 'pageBreak') return new Paragraph({ children: [], pageBreakBefore: true })
      if (block.type === 'h1') return new Paragraph({ text: block.text ?? '', heading: HeadingLevel.HEADING_1 })
      if (block.type === 'h2') return new Paragraph({ text: block.text ?? '', heading: HeadingLevel.HEADING_2 })
      if (block.type === 'bullet') return new Paragraph({ text: block.text ?? '', bullet: { level: 0 } })
      return new Paragraph({ children: [new TextRun(block.text ?? '')] })
    })
    const doc = new Document({ sections: [{ children }] })
    const buffer = await Packer.toBuffer(doc)
    await fs.writeFile(result.filePath, buffer)
    return { success: true, filePath: result.filePath }
  } catch (err) {
    console.error('export-docx failed:', err)
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

const ASSETS_DIR = '.assets'
const ALLOWED_IMAGE_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg'])
const MAX_IMAGE_SIZE_BYTES = 15 * 1024 * 1024 // 15 MB

async function importImageFile(vaultPath: string, sourcePath: string) {
  const ext = path.extname(sourcePath).toLowerCase()
  if (!ALLOWED_IMAGE_EXTENSIONS.has(ext)) {
    return { success: false, error: `Unsupported file type: ${ext || 'unknown'}` }
  }

  try {
    const stats = await fs.stat(sourcePath)
    if (stats.size > MAX_IMAGE_SIZE_BYTES) {
      const sizeMb = (stats.size / (1024 * 1024)).toFixed(1)
      return { success: false, error: `Image is too large (${sizeMb} MB). Maximum size is 15 MB.` }
    }
  } catch (err) {
    console.error('image stat failed:', err)
    return { success: false, error: 'Could not read the selected file.' }
  }

  try {
    const assetsDir = path.join(vaultPath, ASSETS_DIR)
    await fs.mkdir(assetsDir, { recursive: true })
    const safeName = `img_${Date.now()}${ext}`
    const destPath = path.join(assetsDir, safeName)
    await fs.copyFile(sourcePath, destPath)
    return { success: true, relativePath: path.join(ASSETS_DIR, safeName) }
  } catch (err) {
    console.error('import-image failed:', err)
    return { success: false, error: (err as Error).message }
  }
}

ipcMain.handle('vault:import-image-dialog', async (_event, vaultPath: string) => {
  const result = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [{ name: 'Images', extensions: ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'] }],
  })
  if (result.canceled || result.filePaths.length === 0) return null
  return importImageFile(vaultPath, result.filePaths[0])
})

ipcMain.handle('vault:import-image-path', async (_event, vaultPath: string, sourcePath: string) => {
  return importImageFile(vaultPath, sourcePath)
})

ipcMain.handle('vault:get-asset-url', async (_event, vaultPath: string, relativePath: string) => {
  const absolute = path.join(vaultPath, relativePath)
  return `openblaze-asset://local/${encodeURIComponent(absolute)}`
})

app.whenReady().then(() => {
  registerAssetProtocol()
  createWindow()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})