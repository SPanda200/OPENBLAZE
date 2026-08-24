// src/components/modules/locations/LocationEditor.tsx
import { useEffect, useRef, useState } from 'react'
import { Save, Trash2 } from 'lucide-react'
import type { Entity, EntityData } from '../../../types/entity'
import type { Panel } from '../../../types/panel'
import { PanelGrid } from '../../panels/PanelGrid'
import { getDescendantIds } from '../../../utils/buildEntityTree'
import { useUnsavedChanges } from '../../../context/UnsavedChangesContext'

interface LocationEditorProps {
  location: Entity
  allLocations: Entity[]
  onSave: (fileName: string, data: EntityData, content: string) => Promise<void>
  onDelete: () => void
}

export function LocationEditor({ location, allLocations, onSave, onDelete }: LocationEditorProps) {
  const [name, setName] = useState(location.data.name ?? '')
  const [tagsInput, setTagsInput] = useState((location.data.tags ?? []).join(', '))
  const [parentId, setParentId] = useState<string>(location.data.parentId ?? '')
  const [panels, setPanels] = useState<Panel[]>(location.data.panels ?? [])
  const [saving, setSaving] = useState(false)

  const { setDirty, registerHandlers } = useUnsavedChanges()

  const initialSnapshot = useRef(
    JSON.stringify({
      name: location.data.name ?? '',
      tagsInput: (location.data.tags ?? []).join(', '),
      parentId: location.data.parentId ?? '',
      panels: location.data.panels ?? [],
    })
  )

  const excludedIds = getDescendantIds(location.data.id, allLocations)
  excludedIds.add(location.data.id)
  const validParentOptions = allLocations.filter((loc) => !excludedIds.has(loc.data.id))

  const buildData = (): EntityData => ({
    id: location.data.id,
    name: name.trim() || 'Untitled',
    tags: tagsInput.split(',').map((t) => t.trim()).filter(Boolean),
    parentId: parentId || null,
    panels,
  })

  const handleSave = async () => {
    setSaving(true)
    await onSave(location.fileName, buildData(), location.content)
    setSaving(false)
    initialSnapshot.current = JSON.stringify({ name, tagsInput, parentId, panels })
    setDirty(false)
  }

  useEffect(() => {
    const current = JSON.stringify({ name, tagsInput, parentId, panels })
    setDirty(current !== initialSnapshot.current)
  }, [name, tagsInput, parentId, panels, setDirty])

  useEffect(() => {
    registerHandlers({ onSave: handleSave })
    return () => registerHandlers(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, tagsInput, parentId, panels])

  return (
    <div className="space-y-6 pb-16">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0 space-y-1">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Location name" className="text-2xl font-semibold bg-transparent border-b border-transparent focus:border-neutral-700 outline-none w-full text-neutral-100" />
          <input value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} placeholder="tags, comma, separated" className="text-xs text-neutral-500 bg-transparent outline-none w-full" />
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white rounded-md px-4 py-2 text-sm">
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save'}
          </button>
          <button onClick={onDelete} className="text-neutral-600 hover:text-red-500 p-2" title="Delete location">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="max-w-xs">
        <label className="text-xs uppercase tracking-wide text-neutral-500">Nested inside</label>
        <select value={parentId} onChange={(e) => setParentId(e.target.value)} className="mt-1 w-full bg-neutral-900 border border-neutral-800 rounded-md px-3 py-2 text-sm text-neutral-200 outline-none focus:border-orange-600">
          <option value="">— Top level (no parent) —</option>
          {validParentOptions.map((loc) => (
            <option key={loc.data.id} value={loc.data.id}>{loc.data.name || 'Untitled'}</option>
          ))}
        </select>
      </div>

      <PanelGrid panels={panels} onChange={setPanels} />
    </div>
  )
}