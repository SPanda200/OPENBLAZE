// src/components/modules/locations/LocationsModule.tsx
import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useLocationData } from '../../../hooks/useLocationData'
import { buildLocationTree } from '../../../utils/buildLocationTree'
import { LocationTree } from './LocationTree'
import { LocationEditor } from './LocationEditor'

export function LocationsModule() {
  const { locations, loading, createLocation, saveLocation, deleteLocation } = useLocationData()
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null)

  const tree = buildLocationTree(locations)
  const selected = locations.find((l) => l.fileName === selectedFileName) ?? null

  const handleCreateRoot = async () => {
    const created = await createLocation(null)
    setSelectedFileName(created.fileName)
  }

  const handleAddChild = async (parentId: string) => {
    const created = await createLocation(parentId)
    setSelectedFileName(created.fileName)
  }

  const handleDelete = async (fileName: string) => {
    // Note: children of a deleted location become top-level automatically,
    // since buildLocationTree falls back to root when a parentId no longer resolves.
    await deleteLocation(fileName)
    if (selectedFileName === fileName) setSelectedFileName(null)
  }

  return (
    <div className="flex h-full -m-6">
      <div className="w-72 shrink-0 border-r border-neutral-800 flex flex-col">
        <div className="p-3 border-b border-neutral-800">
          <button
            onClick={handleCreateRoot}
            className="w-full flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 text-white rounded-md px-3 py-2 text-sm"
          >
            <Plus className="w-4 h-4" />
            New Top-Level Location
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {loading && <p className="text-sm text-neutral-500 p-4">Loading...</p>}
          {!loading && locations.length === 0 && (
            <p className="text-sm text-neutral-500 p-4">No locations yet.</p>
          )}
          <LocationTree
            nodes={tree}
            selectedFileName={selectedFileName}
            onSelect={setSelectedFileName}
            onAddChild={handleAddChild}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {selected ? (
          <LocationEditor
            key={selected.fileName}
            location={selected}
            allLocations={locations}
            onSave={saveLocation}
            onDelete={() => handleDelete(selected.fileName)}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-neutral-600 text-sm">
            Select a location, or hover one in the tree and click + to nest a new one inside it.
          </div>
        )}
      </div>
    </div>
  )
}