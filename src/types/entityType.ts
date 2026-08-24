// src/types/entityType.ts
import type { Panel } from './panel'

export interface EntityTypeDefinition {
  id: string
  label: string          // singular, e.g. "Character"
  pluralLabel: string     // e.g. "Characters"
  folder: string          // storage subfolder name
  icon: string             // key into iconOptions.ts
  nestable: boolean        // supports parent/child tree like Locations
  isBuiltIn: boolean        // Characters & Locations — can't be deleted
  defaultPanels: Panel[]    // starting template for new entries
}