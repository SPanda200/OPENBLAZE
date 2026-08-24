// src/components/panels/EntityPicker.tsx
import { useEntitySearch } from '../../hooks/useEntitySearch'
import type { LinkableEntity } from '../../types/entity'

interface EntityPickerProps {
  query: string
  highlightedIndex: number
  onSelect: (entity: LinkableEntity) => void
}

export function EntityPicker({ query, highlightedIndex, onSelect }: EntityPickerProps) {
  const { results, loading } = useEntitySearch(query)

  return (
    <div className="absolute left-0 top-full mt-1 z-20 w-64 bg-neutral-800 border border-neutral-700 rounded-md shadow-lg py-1 text-sm max-h-64 overflow-y-auto">
      {loading && <p className="px-3 py-2 text-neutral-500 text-xs">Loading...</p>}
      {!loading && results.length === 0 && <p className="px-3 py-2 text-neutral-500 text-xs">No matches for "{query}"</p>}
      {results.map((entity, i) => (
        <button
          key={`${entity.entityTypeId}-${entity.id}`}
          onMouseDown={(e) => { e.preventDefault(); onSelect(entity) }}
          className={`w-full flex items-center justify-between gap-2 px-3 py-1.5 text-left ${
            i === highlightedIndex ? 'bg-orange-600/20 text-orange-300' : 'text-neutral-200 hover:bg-neutral-700'
          }`}
        >
          <span className="truncate">{entity.name || 'Untitled'}</span>
          <span className="text-[10px] uppercase tracking-wide text-neutral-500 shrink-0">{entity.typeLabel}</span>
        </button>
      ))}
    </div>
  )
}