// src/context/EntityRegistryContext.tsx
import { createContext, useContext, useMemo } from 'react'
import type { ReactNode } from 'react'
import { useEntityData } from '../hooks/useEntityData'
import { ENTITY_TYPES } from '../config/entityTypes'
import type { LinkableEntity } from '../types/entity'

interface EntityRegistryContextValue {
  entities: LinkableEntity[]
  loading: boolean
  refresh: () => void
}

const EntityRegistryContext = createContext<EntityRegistryContextValue | undefined>(undefined)

export function EntityRegistryProvider({ children }: { children: ReactNode }) {
  // Adding a new entity type later: register it in entityTypes.ts,
  // then add one more useEntityData(...) call + map below.
  const characters = useEntityData('Characters')
  const locations = useEntityData('Locations')

  const entities = useMemo<LinkableEntity[]>(() => {
    const characterType = ENTITY_TYPES.find((t) => t.folder === 'Characters')!
    const locationType = ENTITY_TYPES.find((t) => t.folder === 'Locations')!
    return [
      ...characters.entities.map((e) => ({
        id: e.data.id, name: e.data.name, moduleKey: characterType.moduleKey, typeLabel: characterType.label, fileName: e.fileName,
      })),
      ...locations.entities.map((e) => ({
        id: e.data.id, name: e.data.name, moduleKey: locationType.moduleKey, typeLabel: locationType.label, fileName: e.fileName,
      })),
    ]
  }, [characters.entities, locations.entities])

  const refresh = () => {
    characters.refresh()
    locations.refresh()
  }

  return (
    <EntityRegistryContext.Provider value={{ entities, loading: characters.loading || locations.loading, refresh }}>
      {children}
    </EntityRegistryContext.Provider>
  )
}

export function useEntityRegistry() {
  const ctx = useContext(EntityRegistryContext)
  if (!ctx) throw new Error('useEntityRegistry must be used within EntityRegistryProvider')
  return ctx
}