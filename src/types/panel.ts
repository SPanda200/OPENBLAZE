// src/types/panel.ts
export type PanelType = 'text' | 'list' | 'stats' | 'table' | 'image' | 'links' | 'attributes'
export type PanelWidth = 'half' | 'full'

export interface TextPanelData { text: string }
export interface ListPanelData { items: string[] }
export interface StatsPanelData { stats: { label: string; value: string }[] }
export interface TablePanelData { columns: string[]; rows: string[][] }
export interface ImagePanelData { imageUrl: string; caption: string }
export interface LinksPanelData { links: { label: string; url: string }[] }
export interface AttributesPanelData { attributes: { label: string; value: string }[] }

export type AnyPanelData =
  | TextPanelData | ListPanelData | StatsPanelData | TablePanelData
  | ImagePanelData | LinksPanelData | AttributesPanelData

export interface Panel {
  id: string
  type: PanelType
  title: string
  width: PanelWidth
  data: AnyPanelData
}

export function createEmptyPanelData(type: PanelType): AnyPanelData {
  switch (type) {
    case 'text': return { text: '' }
    case 'list': return { items: [] }
    case 'stats': return { stats: [] }
    case 'table': return { columns: ['Column 1', 'Column 2'], rows: [] }
    case 'image': return { imageUrl: '', caption: '' }
    case 'links': return { links: [] }
    case 'attributes': return { attributes: [] }
  }
}