// src/context/EntityTypesContext.tsx
import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import type { ReactNode } from 'react'
import { useVault } from './VaultContext'
import type { EntityTypeDefinition } from '../types/entityType'
import { getBuiltInEntityTypes } from '../config/builtInEntityTypes'

interface EntityTypesContextValue {
  entityTypes: EntityTypeDefinition[]
  loading: boolean
  createEntityType: (def: Omit<EntityTypeDefinition, 'id' | 'isBuiltIn'>) => Promise<void>
  deleteEntityType: (id: string) => Promise<void>
}

const EntityTypesContext = createContext<EntityTypesContextValue | undefined>(undefined)
const CONFIG_KEY = 'entity-types'

function slugify(label: string) {
  return label.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `type-${Date.now()}`
}

export function EntityTypesProvider({ children }: { children: ReactNode }) {
  const { vaultPath } = useVault()
  const [entityTypes, setEntityTypes] = useState<EntityTypeDefinition[]>([])
  const [loading, setLoading] = useState(false)

  const load = useCallback(async () => {
    if (!vaultPath) { setEntityTypes([]); return }
    setLoading(true)
    const stored = await window.electron.readConfig(vaultPath, CONFIG_KEY)
    if (stored && Array.isArray(stored)) {
      setEntityTypes(stored)
    } else {
      const seed = getBuiltInEntityTypes()
      await window.electron.writeConfig(vaultPath, CONFIG_KEY, seed)
      setEntityTypes(seed)
    }
    setLoading(false)
  }, [vaultPath])

  useEffect(() => { load() }, [load])

  const persist = async (next: EntityTypeDefinition[]) => {
    setEntityTypes(next)
    if (vaultPath) await window.electron.writeConfig(vaultPath, CONFIG_KEY, next)
  }

  const createEntityType = async (def: Omit<EntityTypeDefinition, 'id' | 'isBuiltIn'>) => {
    const id = slugify(def.pluralLabel)
    const newType: EntityTypeDefinition = { ...def, id, isBuiltIn: false }
    await persist([...entityTypes, newType])
  }

  const deleteEntityType = async (id: string) => {
    const target = entityTypes.find((t) => t.id === id)
    if (!target || target.isBuiltIn) return
    await persist(entityTypes.filter((t) => t.id !== id))
    // Note: this only removes the type from navigation — .md files already
    // saved in that folder are left untouched on disk, never deleted.
  }

  return (
    <EntityTypesContext.Provider value={{ entityTypes, loading, createEntityType, deleteEntityType }}>
      {children}
    </EntityTypesContext.Provider>
  )
}

export function useEntityTypes() {
  const ctx = useContext(EntityTypesContext)
  if (!ctx) throw new Error('useEntityTypes must be used within EntityTypesProvider')
  return ctx
}