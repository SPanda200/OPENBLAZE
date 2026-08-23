// src/components/panels/EntityPicker.tsx
import { useEntityRegistry } from '../../context/EntityRegistryContext'
import type { LinkableEntity } from '../../types/entity'

interface EntityPickerProps {
  query: string
  onSelect: (entity: LinkableEntity) => void
  onClose: () => void
}

export function EntityPicker({ query, onSelect }: EntityPickerProps) {
  const { entities, loading } = useEntityRegistry()
  const filtered = entities.filter((e) => e.name.toLowerCase().includes(query.toLowerCase())).slice(0, 8)

  return (
    <div className="absolute left-0 top-full mt-1 z-20 w-64 bg-neutral-800 border border-neutral-700 rounded-md shadow-lg py-1 text-sm max-h-64 overflow-y-auto">
      {loading && <p className="px-3 py-2 text-neutral-500 text-xs">Loading...</p>}
      {!loading && filtered.length === 0 && <p className="px-3 py-2 text-neutral-500 text-xs">No matches for "{query}"</p>}
      {filtered.map((entity) => (
        <button
          key={`${entity.moduleKey}-${entity.id}`}
          onMouseDown={(e) => { e.preventDefault(); onSelect(entity) }} // preventDefault keeps the textarea focused, avoiding a blur race
          className="w-full flex items-center justify-between gap-2 px-3 py-1.5 text-neutral-200 hover:bg-neutral-700 text-left"
        >
          <span className="truncate">{entity.name || 'Untitled'}</span>
          <span className="text-[10px] uppercase tracking-wide text-neutral-500 shrink-0">{entity.typeLabel}</span>
        </button>
      ))}
    </div>
  )
}