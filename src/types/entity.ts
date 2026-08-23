// src/types/entity.ts
import type { Panel } from './panel'
import type { ModuleKey } from './navigation'

export interface LinkableEntity {
  id: string
  name: string
  moduleKey: ModuleKey
  typeLabel: string
  fileName: string
}

export interface EntityData {
  id: string
  name: string
  parentId?: string | null   // only meaningful for Locations; ignored elsewhere
  tags?: string[]
  panels: Panel[]
}

export interface Entity {
  data: EntityData
  content: string
  fileName: string
}