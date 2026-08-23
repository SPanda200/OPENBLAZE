// src/components/UnsavedChangesModal.tsx
import { AlertTriangle } from 'lucide-react'

interface UnsavedChangesModalProps {
  saving: boolean
  onSave: () => void
  onDiscard: () => void
  onCancel: () => void
}

export function UnsavedChangesModal({ saving, onSave, onDiscard, onCancel }: UnsavedChangesModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-neutral-900 border border-neutral-700 rounded-lg shadow-xl w-full max-w-sm p-5">
        <div className="flex items-start gap-3">
          <div className="shrink-0 w-9 h-9 rounded-full bg-orange-600/20 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-orange-400" />
          </div>
          <div>
            <h2 className="text-neutral-100 font-medium">Unsaved changes</h2>
            <p className="text-sm text-neutral-400 mt-1">
              You have unsaved changes. Do you want to save them before continuing?
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-5">
          <button onClick={onCancel} disabled={saving} className="px-3 py-1.5 text-sm text-neutral-400 hover:text-neutral-200 rounded-md disabled:opacity-50">
            Cancel
          </button>
          <button onClick={onDiscard} disabled={saving} className="px-3 py-1.5 text-sm text-neutral-300 hover:bg-neutral-800 border border-neutral-700 rounded-md disabled:opacity-50">
            Don't Save
          </button>
          <button onClick={onSave} disabled={saving} className="px-3 py-1.5 text-sm bg-orange-600 hover:bg-orange-700 text-white rounded-md disabled:opacity-50">
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}