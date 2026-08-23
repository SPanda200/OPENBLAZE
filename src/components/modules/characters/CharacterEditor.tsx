// src/components/modules/characters/CharacterEditor.tsx
import { useState } from 'react'
import { Save, Trash2 } from 'lucide-react'
import type { Entity, EntityData } from '../../../types/entity'
import type { Panel } from '../../../types/panel'
import { PanelGrid } from '../../panels/PanelGrid'

interface CharacterEditorProps {
  character: Entity
  onSave: (fileName: string, data: EntityData, content: string) => Promise<void>
  onDelete: () => void
}

export function CharacterEditor({ character, onSave, onDelete }: CharacterEditorProps) {
  const [name, setName] = useState(character.data.name ?? '')
  const [tagsInput, setTagsInput] = useState((character.data.tags ?? []).join(', '))
  const [panels, setPanels] = useState<Panel[]>(character.data.panels ?? [])
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    const data: EntityData = {
      id: character.data.id,
      name: name.trim() || 'Untitled',
      tags: tagsInput.split(',').map((t) => t.trim()).filter(Boolean),
      panels,
    }
    await onSave(character.fileName, data, character.content)
    setSaving(false)
  }

  return (
    <div className="space-y-6 pb-16">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0 space-y-1">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Character name"
            className="text-2xl font-semibold bg-transparent border-b border-transparent focus:border-neutral-700 outline-none w-full text-neutral-100"
          />
          <input
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            placeholder="tags, comma, separated"
            className="text-xs text-neutral-500 bg-transparent outline-none w-full"
          />
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white rounded-md px-4 py-2 text-sm">
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save'}
          </button>
          <button onClick={onDelete} className="text-neutral-600 hover:text-red-500 p-2" title="Delete character">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <PanelGrid panels={panels} onChange={setPanels} />
    </div>
  )
}