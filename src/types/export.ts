// src/types/export.ts
export interface ExportBlock {
  type: 'h1' | 'h2' | 'p' | 'bullet' | 'pageBreak'
  text?: string
}