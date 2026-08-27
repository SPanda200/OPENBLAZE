// src/components/search/SearchModal.tsx
import { useEffect, useRef, useState } from 'react'
import { Search, X, BookOpen } from 'lucide-react'
import { useEntityRegistry } from '../../context/EntityRegistryContext'
import { useNavigation } from '../../context/NavigationContext'
import { useEntityTypes } from '../../context/EntityTypesContext'
import { getIconComponent } from '../../config/iconOptions'

export function SearchModal({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState('')
  const [highlightedIndex, setHighlightedIndex] = useState(0)
  const { search } = useEntityRegistry()
  const { navigateToEntity } = useNavigation()
  const { entityTypes } = useEntityTypes()
  const inputRef = useRef<HTMLInputElement>(null)

  const results = search(query)

  useEffect(() => { inputRef.current?.focus() }, [])
  useEffect(() => { setHighlightedIndex(0) }, [query])

  const handleSelect = (result: (typeof results)[number]) => {
    navigateToEntity(result.entityTypeId, result.id)
    onClose()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') { onClose(); return }
    if (results.length === 0) return
    if (e.key === 'ArrowDown') { e.preventDefault(); setHighlightedIndex((i) => (i + 1) % results.length) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setHighlightedIndex((i) => (i - 1 + results.length) % results.length) }
    else if (e.key === 'Enter') { e.preventDefault(); handleSelect(results[highlightedIndex]) }
  }

  const iconFor = (entityTypeId: string) => {
    if (entityTypeId === 'manuscript') return BookOpen
    const type = entityTypes.find((t) => t.id === entityTypeId)
    return type ? getIconComponent(type.icon) : Search
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 pt-24" onClick={onClose}>
      <div className="bg-neutral-900 border border-neutral-700 rounded-lg shadow-xl w-full max-w-lg overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-2 px-4 py-3 border-b border-neutral-800">
          <Search className="w-4 h-4 text-neutral-500 shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search characters, locations, chapters..."
            className="flex-1 bg-transparent text-sm text-neutral-200 outline-none placeholder-neutral-600"
          />
          <button onClick={onClose} className="text-neutral-600 hover:text-neutral-300 shrink-0"><X className="w-4 h-4" /></button>
        </div>

        <div className="max-h-80 overflow-y-auto">
          {query.trim() === '' && <p className="px-4 py-6 text-center text-sm text-neutral-600">Start typing to search the whole vault.</p>}
          {query.trim() !== '' && results.length === 0 && <p className="px-4 py-6 text-center text-sm text-neutral-600">No results for "{query}"</p>}
          {results.map((result, i) => {
            const Icon = iconFor(result.entityTypeId)
            return (
              <button
                key={`${result.entityTypeId}-${result.id}`}
                onClick={() => handleSelect(result)}
                className={`w-full flex items-start gap-3 px-4 py-2.5 text-left ${i === highlightedIndex ? 'bg-orange-600/20' : 'hover:bg-neutral-800'}`}
              >
                <Icon className="w-4 h-4 text-neutral-500 mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <div className={`text-sm truncate ${i === highlightedIndex ? 'text-orange-300' : 'text-neutral-200'}`}>
                    {result.name || 'Untitled'}
                    <span className="text-[10px] uppercase tracking-wide text-neutral-500 ml-2">{result.typeLabel}</span>
                  </div>
                  {result.snippet && <div className="text-xs text-neutral-500 truncate mt-0.5">{result.snippet}</div>}
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}