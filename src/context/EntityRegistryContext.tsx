// src/context/EntityRegistryContext.tsx
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { useVault } from './VaultContext'
import { useEntityTypes } from './EntityTypesContext'
import type { LinkableEntity, Entity } from '../types/entity'
import type { Chapter } from '../types/chapter'
import { LINK_TOKEN_REGEX } from '../components/shared/LinkedText'

export interface BacklinkSource {
  sourceType: 'entity' | 'chapter'
  sourceEntityTypeId: string
  sourceId: string
  sourceName: string
  panelTitles: string[]   // every panel/place the link appeared, deduped
}

export interface SearchResult {
  kind: 'entity' | 'chapter'
  id: string
  entityTypeId: string          // entity type id, or 'manuscript'
  name: string
  typeLabel: string
  fileName: string
  snippet?: string
}

interface EntityRegistryContextValue {
  entities: LinkableEntity[]
  loading: boolean
  refresh: () => void
  getBacklinks: (entityTypeId: string, id: string) => BacklinkSource[]
  search: (query: string) => SearchResult[]
}

const EntityRegistryContext = createContext<EntityRegistryContextValue | undefined>(undefined)
const MANUSCRIPT_TYPE_ID = 'manuscript'
const MANUSCRIPT_FOLDER = 'Manuscript'

function buildSnippet(text: string, matchIndex: number, matchLength: number): string {
  const radius = 40
  const start = Math.max(0, matchIndex - radius)
  const end = Math.min(text.length, matchIndex + matchLength + radius)
  const prefix = start > 0 ? '…' : ''
  const suffix = end < text.length ? '…' : ''
  return prefix + text.slice(start, end).replace(/\s+/g, ' ').trim() + suffix
}

export function EntityRegistryProvider({ children }: { children: ReactNode }) {
  const { vaultPath } = useVault()
  const { entityTypes } = useEntityTypes()
  const [rawEntities, setRawEntities] = useState<{ entity: Entity; entityTypeId: string; typeLabel: string }[]>([])
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [loading, setLoading] = useState(false)
  const [tick, setTick] = useState(0)

  const refresh = useCallback(() => setTick((t) => t + 1), [])

  useEffect(() => {
    let cancelled = false
    async function load() {
      if (!vaultPath) { setRawEntities([]); setChapters([]); return }
      setLoading(true)

      const entityResults: { entity: Entity; entityTypeId: string; typeLabel: string }[] = []
      for (const type of entityTypes) {
        const fileNames = await window.electron.listEntries(vaultPath, type.folder)
        const loaded = await Promise.all(fileNames.map((fn) => window.electron.readEntry(vaultPath, type.folder, fn)))
        loaded.forEach((e: any) => entityResults.push({ entity: e as Entity, entityTypeId: type.id, typeLabel: type.label }))
      }

      const chapterFileNames = await window.electron.listEntries(vaultPath, MANUSCRIPT_FOLDER)
      const loadedChapters = await Promise.all(chapterFileNames.map((fn) => window.electron.readEntry(vaultPath, MANUSCRIPT_FOLDER, fn)))
      const normalizedChapters = (loadedChapters as any[]).map((c) => ({ ...c, data: { order: 0, mode: 'markdown', ...c.data } })) as Chapter[]
      normalizedChapters.sort((a, b) => a.data.order - b.data.order)

      if (!cancelled) {
        setRawEntities(entityResults)
        setChapters(normalizedChapters)
        setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [vaultPath, entityTypes, tick])

  const entities = useMemo<LinkableEntity[]>(
    () => rawEntities.map(({ entity, entityTypeId, typeLabel }) => ({
      id: entity.data.id, name: entity.data.name, entityTypeId, typeLabel, fileName: entity.fileName,
    })),
    [rawEntities]
  )

  const backlinkIndex = useMemo(() => {
    const raw = new Map<string, BacklinkSource>()

    const addBacklink = (targetKey: string, source: { sourceType: 'entity' | 'chapter'; sourceEntityTypeId: string; sourceId: string; sourceName: string; panelTitle?: string }) => {
      const sourceKey = `${targetKey}|${source.sourceType}|${source.sourceId}`
      const existing = raw.get(sourceKey)
      if (existing) {
        if (source.panelTitle && !existing.panelTitles.includes(source.panelTitle)) {
          existing.panelTitles.push(source.panelTitle)
        }
      } else {
        raw.set(sourceKey, {
          sourceType: source.sourceType,
          sourceEntityTypeId: source.sourceEntityTypeId,
          sourceId: source.sourceId,
          sourceName: source.sourceName,
          panelTitles: source.panelTitle ? [source.panelTitle] : [],
        })
      }
    }

    const scanText = (text: string, source: { sourceType: 'entity' | 'chapter'; sourceEntityTypeId: string; sourceId: string; sourceName: string; panelTitle?: string }) => {
      const regex = new RegExp(LINK_TOKEN_REGEX)
      let match: RegExpExecArray | null
      while ((match = regex.exec(text)) !== null) {
        const [, targetTypeId, targetId] = match
        addBacklink(`${targetTypeId}:${targetId}`, source)
      }
    }

    rawEntities.forEach(({ entity, entityTypeId }) => {
      (entity.data.panels ?? []).forEach((panel) => {
        if (panel.type === 'text') {
          scanText((panel.data as any).text ?? '', {
            sourceType: 'entity', sourceEntityTypeId: entityTypeId, sourceId: entity.data.id,
            sourceName: entity.data.name, panelTitle: panel.title,
          })
        }
      })
    })

    chapters.forEach((chapter) => {
      scanText(chapter.content ?? '', {
        sourceType: 'chapter', sourceEntityTypeId: MANUSCRIPT_TYPE_ID, sourceId: chapter.data.id, sourceName: chapter.data.title,
      })
    })

    const index = new Map<string, BacklinkSource[]>()
    raw.forEach((source, sourceKey) => {
      const [targetKey] = sourceKey.split('|')
      if (!index.has(targetKey)) index.set(targetKey, [])
      index.get(targetKey)!.push(source)
    })
    return index
  }, [rawEntities, chapters])

  const getBacklinks = useCallback(
    (entityTypeId: string, id: string) => backlinkIndex.get(`${entityTypeId}:${id}`) ?? [],
    [backlinkIndex]
  )

  const search = useCallback((query: string): SearchResult[] => {
    const q = query.trim().toLowerCase()
    if (!q) return []
    const results: SearchResult[] = []

    rawEntities.forEach(({ entity, entityTypeId, typeLabel }) => {
      const nameMatch = entity.data.name.toLowerCase().includes(q)
      let snippet: string | undefined
      if (!nameMatch) {
        for (const panel of entity.data.panels ?? []) {
          if (panel.type === 'text') {
            const text = (panel.data as any).text ?? ''
            const idx = text.toLowerCase().indexOf(q)
            if (idx !== -1) { snippet = buildSnippet(text, idx, q.length); break }
          }
        }
      }
      if (nameMatch || snippet) {
        results.push({ kind: 'entity', id: entity.data.id, entityTypeId, name: entity.data.name, typeLabel, fileName: entity.fileName, snippet })
      }
    })

    chapters.forEach((chapter) => {
      const titleMatch = chapter.data.title.toLowerCase().includes(q)
      let snippet: string | undefined
      if (!titleMatch) {
        const idx = (chapter.content ?? '').toLowerCase().indexOf(q)
        if (idx !== -1) snippet = buildSnippet(chapter.content, idx, q.length)
      }
      if (titleMatch || snippet) {
        results.push({ kind: 'chapter', id: chapter.data.id, entityTypeId: MANUSCRIPT_TYPE_ID, name: chapter.data.title, typeLabel: 'Chapter', fileName: chapter.fileName, snippet })
      }
    })

    return results.slice(0, 30)
  }, [rawEntities, chapters])

  return (
    <EntityRegistryContext.Provider value={{ entities, loading, refresh, getBacklinks, search }}>
      {children}
    </EntityRegistryContext.Provider>
  )
}

export function useEntityRegistry() {
  const ctx = useContext(EntityRegistryContext)
  if (!ctx) throw new Error('useEntityRegistry must be used within EntityRegistryProvider')
  return ctx
}