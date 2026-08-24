// src/config/builtInEntityTypes.ts
import type { EntityTypeDefinition } from '../types/entityType'
import { characterPanelTemplate, locationPanelTemplate } from '../templates/panelTemplates'

export function getBuiltInEntityTypes(): EntityTypeDefinition[] {
  return [
    { id: 'characters', label: 'Character', pluralLabel: 'Characters', folder: 'Characters', icon: 'users', nestable: false, isBuiltIn: true, defaultPanels: characterPanelTemplate() },
    { id: 'locations', label: 'Location', pluralLabel: 'Locations', folder: 'Locations', icon: 'map', nestable: true, isBuiltIn: true, defaultPanels: locationPanelTemplate() },
  ]
}