// src/components/modules/characters/CharactersModule.tsx
import { useState } from 'react'
import { Plus, User } from 'lucide-react'
import { useCharacterData } from '../../../hooks/useCharacterData'
import { CharacterEditor } from './CharacterEditor'

export function CharactersModule() {
  const { characters, loading, createCharacter, saveCharacter, deleteCharacter } = useCharacterData()
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null)

  const selected = characters.find((c) => c.fileName === selectedFileName) ?? null

  const handleCreate = async () => {
    const created = await createCharacter()
    setSelectedFileName(created.fileName)
  }

  const handleDelete = async (fileName: string, name: string) => {
    const confirmed = window.confirm(`Delete "${name}"? This cannot be undone.`)
    if (!confirmed) return

    const result = await deleteCharacter(fileName) // or deleteLocation(fileName)
    if (!result.success) {
      window.alert(`Couldn't delete: ${result.error ?? 'unknown error'}`)
      return
    }
    if (selectedFileName === fileName) setSelectedFileName(null)
  }

  return (
    <div className="flex h-full -m-6">
      <div className="w-64 shrink-0 border-r border-neutral-800 flex flex-col">
        <div className="p-3 border-b border-neutral-800">
          <button
            onClick={handleCreate}
            className="w-full flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 text-white rounded-md px-3 py-2 text-sm"
          >
            <Plus className="w-4 h-4" />
            New Character
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {loading && <p className="text-sm text-neutral-500 p-4">Loading...</p>}
          {!loading && characters.length === 0 && (
            <p className="text-sm text-neutral-500 p-4">No characters yet.</p>
          )}
          {characters.map((c) => (
            <button
              key={c.fileName}
              onClick={() => setSelectedFileName(c.fileName)}
              className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm text-left border-b border-neutral-800/50 ${
                c.fileName === selectedFileName
                  ? 'bg-orange-600/10 text-orange-400'
                  : 'text-neutral-300 hover:bg-neutral-800'
              }`}
            >
              <User className="w-3.5 h-3.5 shrink-0 opacity-60" />
              <span className="truncate">{c.data.name || 'Untitled'}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {selected ? (
          <CharacterEditor
            key={selected.fileName}
            character={selected}
            onSave={saveCharacter}
            onDelete={() => handleDelete(selected.fileName)}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-neutral-600 text-sm">
            Select a character or create a new one.
          </div>
        )}
      </div>
    </div>
  )
}