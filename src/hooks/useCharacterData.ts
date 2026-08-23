// src/hooks/useCharacterData.ts
import { useEntityData } from './useEntityData'
import { characterPanelTemplate } from '../templates/panelTemplates'
import { useEntityRegistry } from '../context/EntityRegistryContext'
import type { EntityData } from '../types/entity'

export function useCharacterData() {
  const entity = useEntityData('Characters')
  const { refresh: refreshRegistry } = useEntityRegistry()

  const createCharacter = async () => {
    const created = await entity.createEntity(characterPanelTemplate())
    refreshRegistry()
    return created
  }

  const saveCharacter = async (fileName: string, data: EntityData, content: string) => {
    await entity.saveEntity(fileName, data, content)
    refreshRegistry()
  }

  const deleteCharacter = async (fileName: string) => {
    const result = await entity.deleteEntity(fileName)
    refreshRegistry()
    return result
  }

  return { ...entity, characters: entity.entities, createCharacter, saveCharacter, deleteCharacter }
}