// src/components/modules/Dashboard.tsx
import { useState } from 'react'
import { FolderOpen, FolderPlus, FolderCheck } from 'lucide-react'
import { useVault } from '../../context/VaultContext'

export function Dashboard() {
  const { vaultPath, selectVault, createVault, clearVault } = useVault()
  const [newProjectName, setNewProjectName] = useState('')
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCreate = async () => {
    setError(null)
    setCreating(true)
    const result = await createVault(newProjectName)
    setCreating(false)
    if (!result.success) setError(result.error ?? 'Something went wrong.')
    else setNewProjectName('')
  }

  if (!vaultPath) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center gap-6 max-w-sm mx-auto">
        <FolderOpen className="w-10 h-10 text-neutral-600" />
        <div>
          <h2 className="text-lg font-medium text-neutral-200">No vault open</h2>
          <p className="text-sm text-neutral-500 mt-1">
            Create a new project, or open an existing OpenBlaze folder.
          </p>
        </div>

        <div className="w-full space-y-2">
          <input
            value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            placeholder="New project name..."
            className="w-full bg-neutral-900 border border-neutral-800 rounded-md px-3 py-2 text-sm text-neutral-200 outline-none focus:border-orange-600"
          />
          <button
            onClick={handleCreate}
            disabled={creating || !newProjectName.trim()}
            className="w-full flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white rounded-md px-4 py-2 text-sm"
          >
            <FolderPlus className="w-4 h-4" />
            {creating ? 'Creating...' : 'Create New Vault'}
          </button>
          {error && <p className="text-xs text-red-400">{error}</p>}
        </div>

        <div className="flex items-center gap-2 w-full text-neutral-700 text-xs">
          <div className="flex-1 h-px bg-neutral-800" />
          or
          <div className="flex-1 h-px bg-neutral-800" />
        </div>

        <button
          onClick={selectVault}
          className="w-full flex items-center justify-center gap-2 border border-neutral-800 hover:bg-neutral-900 text-neutral-300 rounded-md px-4 py-2 text-sm"
        >
          <FolderOpen className="w-4 h-4" />
          Open Existing Vault
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-neutral-200">
        <FolderCheck className="w-5 h-5 text-green-500" />
        <h2 className="text-lg font-medium">Vault Connected</h2>
      </div>
      <p className="text-sm text-neutral-500 break-all">{vaultPath}</p>
      <button onClick={clearVault} className="text-sm text-neutral-500 hover:text-neutral-300 underline">
        Switch vault
      </button>
    </div>
  )
}