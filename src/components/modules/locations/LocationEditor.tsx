// src/components/modules/locations/LocationEditor.tsx
import { useEffect, useRef, useState } from 'react'
import { Save, Trash2 } from 'lucide-react'
import type { Location, LocationData } from '../../../types/location'
import { getDescendantIds } from '../../../utils/buildLocationTree'

interface LocationEditorProps {
  location: Location
  allLocations: Location[]
  onSave: (fileName: string, data: LocationData, content: string) => Promise<void>
  onDelete: () => void
}

export function LocationEditor({ location, allLocations, onSave, onDelete }: LocationEditorProps) {
  const [name, setName] = useState(location.data.name ?? '')
  const [type, setType] = useState(location.data.type ?? '')
  const [climate, setClimate] = useState(location.data.climate ?? '')
  const [tagsInput, setTagsInput] = useState((location.data.tags ?? []).join(', '))
  const [parentId, setParentId] = useState<string>(location.data.parentId ?? '')
  const [content, setContent] = useState(location.content)
  const [saving, setSaving] = useState(false)

  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const MIN_HEIGHT = 120
  const MAX_HEIGHT = 480

  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(Math.max(el.scrollHeight, MIN_HEIGHT), MAX_HEIGHT)}px`
  }, [content])

  // Valid parent options: everyone except this location and its own descendants
  const excludedIds = getDescendantIds(location.data.id, allLocations)
  excludedIds.add(location.data.id)
  const validParentOptions = allLocations.filter((loc) => !excludedIds.has(loc.data.id))

  const handleSave = async () => {
    setSaving(true)
    const data: LocationData = {
      id: location.data.id,
      name: name.trim() || 'Untitled',
      type: type.trim() || undefined,
      climate: climate.trim() || undefined,
      tags: tagsInput.split(',').map((t) => t.trim()).filter(Boolean),
      parentId: parentId || null,
    }
    await onSave(location.fileName, data, content)
    setSaving(false)
  }

  return (
    <div className="max-w-2xl space-y-6 pb-10">
      <div className="flex items-start justify-between gap-4">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Location name"
          className="text-2xl font-semibold bg-transparent border-b border-transparent focus:border-neutral-700 outline-none w-full text-neutral-100"
        />
        <button onClick={onDelete} className="text-neutral-600 hover:text-red-500 shrink-0 p-2" title="Delete location">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div>
        <label className="text-xs uppercase tracking-wide text-neutral-500">Nested inside</label>
        <select
          value={parentId}
          onChange={(e) => setParentId(e.target.value)}
          className="mt-1 w-full bg-neutral-900 border border-neutral-800 rounded-md px-3 py-2 text-sm text-neutral-200 outline-none focus:border-orange-600"
        >
          <option value="">— Top level (no parent) —</option>
          {validParentOptions.map((loc) => (
            <option key={loc.data.id} value={loc.data.id}>
              {loc.data.name || 'Untitled'}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs uppercase tracking-wide text-neutral-500">Type</label>
          <input
            value={type}
            onChange={(e) => setType(e.target.value)}
            placeholder="Continent, Kingdom, City, Building..."
            className="mt-1 w-full bg-neutral-900 border border-neutral-800 rounded-md px-3 py-2 text-sm text-neutral-200 outline-none focus:border-orange-600"
          />
        </div>
        <div>
          <label className="text-xs uppercase tracking-wide text-neutral-500">Climate</label>
          <input
            value={climate}
            onChange={(e) => setClimate(e.target.value)}
            className="mt-1 w-full bg-neutral-900 border border-neutral-800 rounded-md px-3 py-2 text-sm text-neutral-200 outline-none focus:border-orange-600"
          />
        </div>
      </div>

      <div>
        <label className="text-xs uppercase tracking-wide text-neutral-500">Tags</label>
        <input
          value={tagsInput}
          onChange={(e) => setTagsInput(e.target.value)}
          placeholder="coastal, dangerous, ruins"
          className="mt-1 w-full bg-neutral-900 border border-neutral-800 rounded-md px-3 py-2 text-sm text-neutral-200 outline-none focus:border-orange-600"
        />
      </div>

      <div>
        <label className="text-xs uppercase tracking-wide text-neutral-500">Description</label>
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Describe this location..."
          className="mt-1 w-full bg-neutral-900 border border-neutral-800 rounded-md px-3 py-2 text-sm text-neutral-200 outline-none focus:border-orange-600 font-mono resize-none overflow-y-auto"
          style={{ height: `${MIN_HEIGHT}px` }}
        />
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white rounded-md px-4 py-2 text-sm"
      >
        <Save className="w-4 h-4" />
        {saving ? 'Saving...' : 'Save Location'}
      </button>
    </div>
  )
}