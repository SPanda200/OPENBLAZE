// src/components/entities/ManageEntityTypesModal.tsx
import { useState } from 'react'
import { X, Plus, Trash2 } from 'lucide-react'
import { useEntityTypes } from '../../context/EntityTypesContext'
import { getIconComponent, ICON_OPTIONS } from '../../config/iconOptions'
import { PanelGrid } from '../panels/PanelGrid'
import type { Panel } from '../../types/panel'

export function ManageEntityTypesModal({ onClose }: { onClose: () => void }) {
  const { entityTypes, createEntityType, deleteEntityType } = useEntityTypes()
  const [creating, setCreating] = useState(false)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-6">
      <div className="bg-neutral-900 border border-neutral-700 rounded-lg shadow-xl w-full max-w-2xl max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-800">
          <h2 className="text-neutral-100 font-medium">Entity Types</h2>
          <button onClick={onClose} className="text-neutral-500 hover:text-neutral-200"><X className="w-4 h-4" /></button>
        </div>

        <div className="overflow-y-auto p-5 space-y-2">
          {entityTypes.map((type) => {
            const Icon = getIconComponent(type.icon)
            return (
              <div key={type.id} className="flex items-center justify-between gap-2 bg-neutral-800/50 rounded-md px-3 py-2">
                <div className="flex items-center gap-2 text-sm text-neutral-200">
                  <Icon className="w-4 h-4 text-neutral-400" />
                  {type.pluralLabel}
                  {type.isBuiltIn && <span className="text-[10px] uppercase tracking-wide text-neutral-500 border border-neutral-700 rounded px-1.5 py-0.5">Built-in</span>}
                  {type.nestable && <span className="text-[10px] uppercase tracking-wide text-neutral-500 border border-neutral-700 rounded px-1.5 py-0.5">Nestable</span>}
                </div>
                {!type.isBuiltIn && (
                  <button onClick={() => deleteEntityType(type.id)} className="text-neutral-600 hover:text-red-500 p-1" title="Delete entity type">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )
          })}
        </div>

        <div className="border-t border-neutral-800 p-5">
          {!creating ? (
            <button onClick={() => setCreating(true)} className="w-full flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 text-white rounded-md px-3 py-2 text-sm">
              <Plus className="w-4 h-4" /> Create New Entity Type
            </button>
          ) : (
            <CreateEntityTypeForm onCancel={() => setCreating(false)} onCreate={async (def) => { await createEntityType(def); setCreating(false) }} />
          )}
        </div>
      </div>
    </div>
  )
}

function CreateEntityTypeForm({ onCancel, onCreate }: {
  onCancel: () => void
  onCreate: (def: { label: string; pluralLabel: string; folder: string; icon: string; nestable: boolean; defaultPanels: Panel[] }) => Promise<void>
}) {
  const [label, setLabel] = useState('')
  const [pluralLabel, setPluralLabel] = useState('')
  const [icon, setIcon] = useState('sparkles')
  const [nestable, setNestable] = useState(false)
  const [panels, setPanels] = useState<Panel[]>([])
  const [saving, setSaving] = useState(false)
  const canSave = label.trim() && pluralLabel.trim()

  const handleSubmit = async () => {
    if (!canSave) return
    setSaving(true)
    await onCreate({ label: label.trim(), pluralLabel: pluralLabel.trim(), folder: pluralLabel.trim(), icon, nestable, defaultPanels: panels })
    setSaving(false)
  }

  return (
    <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-1">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs uppercase tracking-wide text-neutral-500">Singular Label</label>
          <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Faction" className="mt-1 w-full bg-neutral-900 border border-neutral-800 rounded-md px-3 py-2 text-sm text-neutral-200 outline-none focus:border-orange-600" />
        </div>
        <div>
          <label className="text-xs uppercase tracking-wide text-neutral-500">Plural Label</label>
          <input value={pluralLabel} onChange={(e) => setPluralLabel(e.target.value)} placeholder="Factions" className="mt-1 w-full bg-neutral-900 border border-neutral-800 rounded-md px-3 py-2 text-sm text-neutral-200 outline-none focus:border-orange-600" />
        </div>
      </div>

      <div>
        <label className="text-xs uppercase tracking-wide text-neutral-500 mb-1 block">Icon</label>
        <div className="flex flex-wrap gap-2">
          {Object.entries(ICON_OPTIONS).map(([key, Icon]) => (
            <button key={key} onClick={() => setIcon(key)} className={`w-8 h-8 flex items-center justify-center rounded-md border ${icon === key ? 'border-orange-500 bg-orange-600/20 text-orange-400' : 'border-neutral-800 text-neutral-500 hover:border-neutral-700'}`}>
              <Icon className="w-4 h-4" />
            </button>
          ))}
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-neutral-300">
        <input type="checkbox" checked={nestable} onChange={(e) => setNestable(e.target.checked)} />
        Supports nesting (e.g. continent → kingdom → city)
      </label>

      <div>
        <label className="text-xs uppercase tracking-wide text-neutral-500 mb-1 block">Default Panel Template</label>
        <p className="text-xs text-neutral-600 mb-2">New entries of this type start with these panels. Still editable per-entry afterward.</p>
        <PanelGrid panels={panels} onChange={setPanels} />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <button onClick={onCancel} className="px-3 py-1.5 text-sm text-neutral-400 hover:text-neutral-200">Cancel</button>
        <button onClick={handleSubmit} disabled={!canSave || saving} className="px-3 py-1.5 text-sm bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white rounded-md">
          {saving ? 'Creating...' : 'Create Entity Type'}
        </button>
      </div>
    </div>
  )
}