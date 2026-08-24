// src/components/entities/EntityModule.tsx
import { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import { useEntityData } from '../../hooks/useEntityData'
import { useUnsavedChanges } from '../../context/UnsavedChangesContext'
import { useNavigation } from '../../context/NavigationContext'
import { useEntityRegistry } from '../../context/EntityRegistryContext'
import { buildEntityTree } from '../../utils/buildEntityTree'
import { EntityTree } from './EntityTree'
import { EntityEditor } from './EntityEditor'
import { getIconComponent } from '../../config/iconOptions'
import type { EntityTypeDefinition } from '../../types/entityType'
import type { EntityData } from '../../types/entity'

export function EntityModule({ entityType }: { entityType: EntityTypeDefinition }) {
  const { entities, loading, createEntity, saveEntity, deleteEntity } = useEntityData(entityType.folder)
  const { guardNavigation } = useUnsavedChanges()
  const { pendingTarget, clearPendingTarget } = useNavigation()
  const { refresh: refreshRegistry } = useEntityRegistry()
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null)

  const Icon = getIconComponent(entityType.icon)
  const tree = entityType.nestable ? buildEntityTree(entities) : null
  const selected = entities.find((e) => e.fileName === selectedFileName) ?? null

  useEffect(() => {
    if (pendingTarget?.entityTypeId === entityType.id) {
      const match = entities.find((e) => e.data.id === pendingTarget.entityId)
      if (match) { setSelectedFileName(match.fileName); clearPendingTarget() }
    }
  }, [pendingTarget, entities, clearPendingTarget, entityType.id])

  const handleSelect = (fileName: string) => guardNavigation(() => setSelectedFileName(fileName))

  const handleCreate = (parentId: string | null = null) => guardNavigation(async () => {
    const created = await createEntity(entityType.defaultPanels, entityType.nestable ? { parentId } : {})
    refreshRegistry()
    setSelectedFileName(created.fileName)
  })

  const handleSave = async (fileName: string, data: EntityData, content: string) => {
    await saveEntity(fileName, data, content)
    refreshRegistry()
  }

  const handleDelete = async (fileName: string, name: string) => {
    const confirmed = window.confirm(`Delete "${name}"? This cannot be undone.`)
    if (!confirmed) return
    const result = await deleteEntity(fileName)
    refreshRegistry()
    if (!result.success) { window.alert(`Couldn't delete: ${result.error ?? 'unknown error'}`); return }
    if (selectedFileName === fileName) setSelectedFileName(null)
  }

  return (
    <div className="flex h-full -m-6">
      <div className="w-72 shrink-0 border-r border-neutral-800 flex flex-col">
        <div className="p-3 border-b border-neutral-800">
          <button onClick={() => handleCreate(null)} className="w-full flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 text-white rounded-md px-3 py-2 text-sm">
            <Plus className="w-4 h-4" />
            New {entityType.label}
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {loading && <p className="text-sm text-neutral-500 p-4">Loading...</p>}
          {!loading && entities.length === 0 && <p className="text-sm text-neutral-500 p-4">No {entityType.pluralLabel.toLowerCase()} yet.</p>}

          {entityType.nestable ? (
            <EntityTree nodes={tree!} selectedFileName={selectedFileName} onSelect={handleSelect} onAddChild={(parentId) => handleCreate(parentId)} icon={Icon} />
          ) : (
            entities.map((e) => (
              <button key={e.fileName} onClick={() => handleSelect(e.fileName)} className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm text-left border-b border-neutral-800/50 ${e.fileName === selectedFileName ? 'bg-orange-600/10 text-orange-400' : 'text-neutral-300 hover:bg-neutral-800'}`}>
                <Icon className="w-3.5 h-3.5 shrink-0 opacity-60" />
                <span className="truncate">{e.data.name || 'Untitled'}</span>
              </button>
            ))
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {selected ? (
          <EntityEditor key={selected.fileName} entity={selected} entityType={entityType} allEntities={entities} onSave={handleSave} onDelete={() => handleDelete(selected.fileName, selected.data.name)} />
        ) : (
          <div className="flex items-center justify-center h-full text-neutral-600 text-sm">Select a {entityType.label.toLowerCase()} or create a new one.</div>
        )}
      </div>
    </div>
  )
}