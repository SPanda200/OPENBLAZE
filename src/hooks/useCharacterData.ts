// src/hooks/useCharacterData.ts
import { useEntityData } from './useEntityData'
import { characterPanelTemplate } from '../templates/panelTemplates'

export function useCharacterData() {
  const entity = useEntityData('Characters')
  const createCharacter = () => entity.createEntity(characterPanelTemplate())

  return {
    ...entity,
    characters: entity.entities,
    createCharacter,
    saveCharacter: entity.saveEntity,     // <-- add this alias
    deleteCharacter: entity.deleteEntity, // <-- and this one
  }
}