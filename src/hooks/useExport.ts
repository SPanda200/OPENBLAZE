// src/hooks/useExport.ts
import type { ExportBlock } from '../types/export'

export async function exportAsText(defaultFileName: string, extension: 'md' | 'txt', content: string) {
  const result = await window.electron.exportText(defaultFileName, extension, content)
  if (!result || result.canceled) return
  if (!result.success) window.alert(`Export failed: ${result.error ?? 'unknown error'}`)
}

export async function exportAsDocx(defaultFileName: string, blocks: ExportBlock[]) {
  const result = await window.electron.exportDocx(defaultFileName, blocks)
  if (!result || result.canceled) return
  if (!result.success) window.alert(`Export failed: ${result.error ?? 'unknown error'}`)
}