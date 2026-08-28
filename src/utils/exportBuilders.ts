// src/utils/exportBuilders.ts
import type { Chapter } from '../types/chapter'
import type { Entity } from '../types/entity'
import type { Panel, TextPanelData, ListPanelData, AttributesPanelData, StatsPanelData, TablePanelData, LinksPanelData, ImagePanelData } from '../types/panel'
import type { ExportBlock } from '../types/export'
import { stripLinkTokens } from './wordCount'

function markdownToBlocks(text: string): ExportBlock[] {
  const resolved = stripLinkTokens(text)
  const lines = resolved.split('\n')
  const blocks: ExportBlock[] = []
  let buffer: string[] = []
  const flush = () => { if (buffer.length > 0) { blocks.push({ type: 'p', text: buffer.join(' ') }); buffer = [] } }

  for (const raw of lines) {
    const line = raw.trim()
    if (line === '') { flush(); continue }
    if (line.startsWith('# ')) { flush(); blocks.push({ type: 'h1', text: line.slice(2) }); continue }
    if (line.startsWith('## ')) { flush(); blocks.push({ type: 'h2', text: line.slice(3) }); continue }
    if (line.startsWith('- ') || line.startsWith('* ')) { flush(); blocks.push({ type: 'bullet', text: line.slice(2) }); continue }
    const cleaned = line.replace(/\*\*(.+?)\*\*/g, '$1').replace(/\*(.+?)\*/g, '$1').replace(/`(.+?)`/g, '$1').replace(/^>\s?/, '')
    buffer.push(cleaned)
  }
  flush()
  return blocks
}

function blocksToPlainText(blocks: ExportBlock[]): string {
  return blocks.map((b) => {
    if (b.type === 'h1') return `${b.text}\n${'='.repeat(b.text?.length ?? 0)}`
    if (b.type === 'h2') return `${b.text}\n${'-'.repeat(b.text?.length ?? 0)}`
    if (b.type === 'bullet') return `• ${b.text}`
    if (b.type === 'pageBreak') return ''
    return b.text ?? ''
  }).filter(Boolean).join('\n\n')
}

// ---- Chapters ----
export function chapterToMarkdown(chapter: Chapter): string {
  return `# ${chapter.data.title}\n\n${stripLinkTokens(chapter.content)}`
}
export function chapterToBlocks(chapter: Chapter): ExportBlock[] {
  return [{ type: 'h1', text: chapter.data.title }, ...markdownToBlocks(chapter.content)]
}
export function chapterToPlainText(chapter: Chapter): string {
  return blocksToPlainText(chapterToBlocks(chapter))
}

// ---- Full manuscript ----
export function manuscriptToMarkdown(chapters: Chapter[]): string {
  return chapters.map((c) => `# ${c.data.title}\n\n${stripLinkTokens(c.content)}`).join('\n\n---\n\n')
}
export function manuscriptToBlocks(chapters: Chapter[]): ExportBlock[] {
  const blocks: ExportBlock[] = []
  chapters.forEach((c, i) => { if (i > 0) blocks.push({ type: 'pageBreak' }); blocks.push(...chapterToBlocks(c)) })
  return blocks
}
export function manuscriptToPlainText(chapters: Chapter[]): string {
  return chapters.map((c) => chapterToPlainText(c)).join('\n\n\n')
}

// ---- Entities ----
function panelToBlocks(panel: Panel): ExportBlock[] {
  switch (panel.type) {
    case 'text': {
      const text = stripLinkTokens((panel.data as TextPanelData).text || '')
      return text ? markdownToBlocks(text) : [{ type: 'p', text: '(empty)' }]
    }
    case 'list': {
      const items = (panel.data as ListPanelData).items
      return items.length ? items.map((i) => ({ type: 'bullet', text: i }) as ExportBlock) : [{ type: 'p', text: '(empty)' }]
    }
    case 'attributes': {
      const attrs = (panel.data as AttributesPanelData).attributes
      return attrs.length ? attrs.map((a) => ({ type: 'p', text: `${a.label}: ${a.value || '—'}` }) as ExportBlock) : [{ type: 'p', text: '(empty)' }]
    }
    case 'stats': {
      const stats = (panel.data as StatsPanelData).stats
      return stats.length ? stats.map((s) => ({ type: 'p', text: `${s.label}: ${s.value}` }) as ExportBlock) : [{ type: 'p', text: '(empty)' }]
    }
    case 'table': {
      const t = panel.data as TablePanelData
      return t.rows.length ? t.rows.map((r) => ({ type: 'p', text: r.join(' — ') }) as ExportBlock) : [{ type: 'p', text: '(empty)' }]
    }
    case 'links': {
      const links = (panel.data as LinksPanelData).links
      return links.length ? links.map((l) => ({ type: 'p', text: `${l.label}: ${l.url}` }) as ExportBlock) : [{ type: 'p', text: '(empty)' }]
    }
    case 'image': {
      const cap = (panel.data as ImagePanelData).caption
      return [{ type: 'p', text: cap ? `[Image: ${cap}]` : '[Image]' }]
    }
  }
}

export function entityToBlocks(entity: Entity): ExportBlock[] {
  const blocks: ExportBlock[] = [{ type: 'h1', text: entity.data.name }]
  if (entity.data.tags?.length) blocks.push({ type: 'p', text: `Tags: ${entity.data.tags.join(', ')}` })
  ;(entity.data.panels ?? []).forEach((panel) => { blocks.push({ type: 'h2', text: panel.title }); blocks.push(...panelToBlocks(panel)) })
  return blocks
}

function panelToMarkdown(panel: Panel): string {
  switch (panel.type) {
    case 'text': return stripLinkTokens((panel.data as TextPanelData).text) || '_empty_'
    case 'list': return (panel.data as ListPanelData).items.map((i) => `- ${i}`).join('\n') || '_empty_'
    case 'attributes': return (panel.data as AttributesPanelData).attributes.map((a) => `**${a.label}:** ${a.value || '—'}`).join('\n') || '_empty_'
    case 'stats': return (panel.data as StatsPanelData).stats.map((s) => `**${s.label}:** ${s.value}`).join('\n') || '_empty_'
    case 'table': {
      const t = panel.data as TablePanelData
      return [`| ${t.columns.join(' | ')} |`, `| ${t.columns.map(() => '---').join(' | ')} |`, ...t.rows.map((r) => `| ${r.join(' | ')} |`)].join('\n')
    }
    case 'links': return (panel.data as LinksPanelData).links.map((l) => `- [${l.label}](${l.url})`).join('\n') || '_empty_'
    case 'image': { const cap = (panel.data as ImagePanelData).caption; return cap ? `_Image: ${cap}_` : '_Image_' }
  }
}

export function entityToMarkdown(entity: Entity): string {
  const lines: string[] = [`# ${entity.data.name}`]
  if (entity.data.tags?.length) lines.push(`*Tags: ${entity.data.tags.join(', ')}*`)
  lines.push('')
  ;(entity.data.panels ?? []).forEach((panel) => lines.push(`## ${panel.title}`, panelToMarkdown(panel), ''))
  return lines.join('\n')
}

export function entityToPlainText(entity: Entity): string {
  return blocksToPlainText(entityToBlocks(entity))
}