// src/hooks/useLocationData.ts
import { useEntityData } from './useEntityData'
import { locationPanelTemplate } from '../templates/panelTemplates'

export function useLocationData() {
  const entity = useEntityData('Locations')
  const createLocation = (parentId: string | null = null) =>
    entity.createEntity(locationPanelTemplate(), { parentId })
  return { ...entity, locations: entity.entities, createLocation }
}