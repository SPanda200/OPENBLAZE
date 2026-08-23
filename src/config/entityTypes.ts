// src/config/entityTypes.ts
import type { ModuleKey } from '../types/navigation'

export interface EntityTypeConfig {
  moduleKey: ModuleKey
  folder: string
  label: string
}

export const ENTITY_TYPES: EntityTypeConfig[] = [
  { moduleKey: 'characters', folder: 'Characters', label: 'Character' },
  { moduleKey: 'locations', folder: 'Locations', label: 'Location' },
]