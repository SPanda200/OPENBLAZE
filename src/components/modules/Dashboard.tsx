// src/components/modules/Dashboard.tsx
import { FolderOpen, FolderCheck } from 'lucide-react'
import { useVault } from '../../context/VaultContext'

export function Dashboard() {
  const { vaultPath, selectVault, clearVault } = useVault()

  if (!vaultPath) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center gap-4">
        <FolderOpen className="w-10 h-10 text-neutral-600" />
        <div>
          <h2 className="text-lg font-medium text-neutral-200">No vault open</h2>
          <p className="text-sm text-neutral-500 mt-1">
            Choose a folder on your computer to store your project's characters, locations, and manuscript.
          </p>
        </div>
        <button
          onClick={selectVault}
          className="bg-orange-600 hover:bg-orange-700 text-white rounded-md px-4 py-2 text-sm flex items-center gap-2"
        >
          <FolderOpen className="w-4 h-4" />
          Open Vault Folder
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
      <button
        onClick={clearVault}
        className="text-sm text-neutral-500 hover:text-neutral-300 underline"
      >
        Switch vault
      </button>
    </div>
  )
}