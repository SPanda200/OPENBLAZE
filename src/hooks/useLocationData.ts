// src/hooks/useLocationData.ts
import { useEntityData } from './useEntityData'
import { locationPanelTemplate } from '../templates/panelTemplates'
import { useEntityRegistry } from '../context/EntityRegistryContext'
import type { EntityData } from '../types/entity'

export function useLocationData() {
  const entity = useEntityData('Locations')
  const { refresh: refreshRegistry } = useEntityRegistry()

  const createLocation = async (parentId: string | null = null) => {
    const created = await entity.createEntity(locationPanelTemplate(), { parentId })
    refreshRegistry()
    return created
  }

  const saveLocation = async (fileName: string, data: EntityData, content: string) => {
    await entity.saveEntity(fileName, data, content)
    refreshRegistry()
  }

  const deleteLocation = async (fileName: string) => {
    const result = await entity.deleteEntity(fileName)
    refreshRegistry()
    return result
  }

  return { ...entity, locations: entity.entities, createLocation, saveLocation, deleteLocation }
}