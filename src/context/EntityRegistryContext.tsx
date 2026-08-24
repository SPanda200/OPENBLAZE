// src/context/EntityRegistryContext.tsx
import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { useVault } from './VaultContext'
import { useEntityTypes } from './EntityTypesContext'
import type { LinkableEntity } from '../types/entity'

interface EntityRegistryContextValue {
  entities: LinkableEntity[]
  loading: boolean
  refresh: () => void
}

const EntityRegistryContext = createContext<EntityRegistryContextValue | undefined>(undefined)

export function EntityRegistryProvider({ children }: { children: ReactNode }) {
  const { vaultPath } = useVault()
  const { entityTypes } = useEntityTypes()
  const [entities, setEntities] = useState<LinkableEntity[]>([])
  const [loading, setLoading] = useState(false)
  const [tick, setTick] = useState(0)

  const refresh = useCallback(() => setTick((t) => t + 1), [])

  useEffect(() => {
    let cancelled = false
    async function load() {
      if (!vaultPath || entityTypes.length === 0) { setEntities([]); return }
      setLoading(true)
      const all: LinkableEntity[] = []
      for (const type of entityTypes) {
        const fileNames = await window.electron.listEntries(vaultPath, type.folder)
        const loaded = await Promise.all(fileNames.map((fn) => window.electron.readEntry(vaultPath, type.folder, fn)))
        loaded.forEach((e: any) => all.push({ id: e.data.id, name: e.data.name, entityTypeId: type.id, typeLabel: type.label, fileName: e.fileName }))
      }
      if (!cancelled) { setEntities(all); setLoading(false) }
    }
    load()
    return () => { cancelled = true }
  }, [vaultPath, entityTypes, tick])

  return <EntityRegistryContext.Provider value={{ entities, loading, refresh }}>{children}</EntityRegistryContext.Provider>
}

export function useEntityRegistry() {
  const ctx = useContext(EntityRegistryContext)
  if (!ctx) throw new Error('useEntityRegistry must be used within EntityRegistryProvider')
  return ctx
}