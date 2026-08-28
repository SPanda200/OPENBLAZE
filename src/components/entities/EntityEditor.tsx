// src/components/entities/EntityEditor.tsx
import { useEffect, useRef, useState } from 'react'
import { Save, Trash2 } from 'lucide-react'
import type { Entity, EntityData } from '../../types/entity'
import type { EntityTypeDefinition } from '../../types/entityType'
import type { Panel } from '../../types/panel'
import { PanelGrid } from '../panels/PanelGrid'
import { getDescendantIds } from '../../utils/buildEntityTree'
import { useUnsavedChanges } from '../../context/UnsavedChangesContext'
import { BacklinksPanel } from './BacklinksPanel'
import { ExportMenu, type ExportFormat } from '../shared/ExportMenu'
import { exportAsText, exportAsDocx } from '../../hooks/useExport'
import { entityToMarkdown, entityToPlainText, entityToBlocks } from '../../utils/exportBuilders'

interface EntityEditorProps {
  entity: Entity
  entityType: EntityTypeDefinition
  allEntities: Entity[]
  onSave: (fileName: string, data: EntityData, content: string) => Promise<void>
  onDelete: () => void
}

export function EntityEditor({ entity, entityType, allEntities, onSave, onDelete }: EntityEditorProps) {
  const [name, setName] = useState(entity.data.name ?? '')
  const [tagsInput, setTagsInput] = useState((entity.data.tags ?? []).join(', '))
  const [parentId, setParentId] = useState<string>(entity.data.parentId ?? '')
  const [panels, setPanels] = useState<Panel[]>(entity.data.panels ?? [])
  const [saving, setSaving] = useState(false)

  const { setDirty, registerHandlers } = useUnsavedChanges()
  const initialSnapshot = useRef(JSON.stringify({
    name: entity.data.name ?? '', tagsInput: (entity.data.tags ?? []).join(', '),
    parentId: entity.data.parentId ?? '', panels: entity.data.panels ?? [],
  }))

  const excludedIds = entityType.nestable ? getDescendantIds(entity.data.id, allEntities) : new Set<string>()
  excludedIds.add(entity.data.id)
  const validParentOptions = allEntities.filter((e) => !excludedIds.has(e.data.id))

  const buildData = (): EntityData => ({
    id: entity.data.id,
    name: name.trim() || 'Untitled',
    tags: tagsInput.split(',').map((t) => t.trim()).filter(Boolean),
    parentId: entityType.nestable ? (parentId || null) : undefined,
    panels,
  })

  const handleSave = async () => {
    setSaving(true)
    await onSave(entity.fileName, buildData(), entity.content)
    setSaving(false)
    initialSnapshot.current = JSON.stringify({ name, tagsInput, parentId, panels })
    setDirty(false)
  }

  const handleExport = async (format: ExportFormat) => {
    const exportEntity = { ...entity, data: buildData() }
    const safeName = name.trim() || 'Untitled'
    if (format === 'md') await exportAsText(`${safeName}.md`, 'md', entityToMarkdown(exportEntity))
    else if (format === 'txt') await exportAsText(`${safeName}.txt`, 'txt', entityToPlainText(exportEntity))
    else await exportAsDocx(`${safeName}.docx`, entityToBlocks(exportEntity))
  }

  useEffect(() => {
    setDirty(JSON.stringify({ name, tagsInput, parentId, panels }) !== initialSnapshot.current)
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
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder={`${entityType.label} name`} className="text-2xl font-semibold bg-transparent border-b border-transparent focus:border-neutral-700 outline-none w-full text-neutral-100" />
          <input value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} placeholder="tags, comma, separated" className="text-xs text-neutral-500 bg-transparent outline-none w-full" />
        </div>
        
        {/* --- UPDATED SECTION --- */}
        <div className="flex items-center gap-2 shrink-0">
          <ExportMenu onExport={handleExport} />
          <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white rounded-md px-4 py-2 text-sm">
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save'}
          </button>
          <button onClick={onDelete} className="text-neutral-600 hover:text-red-500 p-2" title={`Delete ${entityType.label.toLowerCase()}`}>
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
        {/* ----------------------- */}

      </div>

      {entityType.nestable && (
        <div className="max-w-xs">
          <label className="text-xs uppercase tracking-wide text-neutral-500">Nested inside</label>
          <select value={parentId} onChange={(e) => setParentId(e.target.value)} className="mt-1 w-full bg-neutral-900 border border-neutral-800 rounded-md px-3 py-2 text-sm text-neutral-200 outline-none focus:border-orange-600">
            <option value="">— Top level (no parent) —</option>
            {validParentOptions.map((e) => <option key={e.data.id} value={e.data.id}>{e.data.name || 'Untitled'}</option>)}
          </select>
        </div>
      )}

      <PanelGrid panels={panels} onChange={setPanels} />
      <BacklinksPanel entityTypeId={entityType.id} entityId={entity.data.id} />
    </div>
  )
}
