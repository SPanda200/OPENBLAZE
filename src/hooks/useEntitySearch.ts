// src/hooks/useEntitySearch.ts
import { useMemo } from 'react'
import { useEntityRegistry } from '../context/EntityRegistryContext'
import type { LinkableEntity } from '../types/entity'

export function useEntitySearch(query: string): { results: LinkableEntity[]; loading: boolean } {
  const { entities, loading } = useEntityRegistry()
  const results = useMemo(
    () => entities.filter((e) => e.name.toLowerCase().includes(query.toLowerCase())).slice(0, 8),
    [entities, query]
  )
  return { results, loading }
}