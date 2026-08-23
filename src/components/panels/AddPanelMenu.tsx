// src/components/panels/AddPanelMenu.tsx
import { useEffect, useRef, useState } from 'react'
import { Plus, Type, List, BarChart2, Table2, Image, Link2, Info, Trash2 } from 'lucide-react'
import type { PanelType } from '../../types/panel'

interface AddPanelMenuProps {
  onAdd: (type: PanelType) => void
  onDeleteAll: () => void
}

const PANEL_OPTIONS: { type: PanelType; label: string; icon: React.ElementType }[] = [
  { type: 'text', label: 'Text Panel', icon: Type },
  { type: 'list', label: 'List Panel', icon: List },
  { type: 'stats', label: 'Stats Panel', icon: BarChart2 },
  { type: 'table', label: 'Table Panel', icon: Table2 },
  { type: 'image', label: 'Image Panel', icon: Image },
  { type: 'links', label: 'Links Panel', icon: Link2 },
  { type: 'attributes', label: 'Attributes Panel', icon: Info },
]

export function AddPanelMenu({ onAdd, onDeleteAll }: AddPanelMenuProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen((o) => !o)} className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white rounded-md px-3 py-1.5 text-sm">
        <Plus className="w-4 h-4" />
        Add Panel
      </button>
      {open && (
        <div className="absolute right-0 top-9 z-10 w-52 bg-neutral-800 border border-neutral-700 rounded-md shadow-lg py-1 text-sm overflow-hidden">
          {PANEL_OPTIONS.map(({ type, label, icon: Icon }) => (
            <button
              key={type}
              onClick={() => { onAdd(type); setOpen(false) }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-neutral-300 hover:bg-neutral-700"
            >
              <Icon className="w-4 h-4 text-neutral-500" />
              {label}
            </button>
          ))}
          <div className="border-t border-neutral-700 mt-1 pt-1">
            <button
              onClick={() => { onDeleteAll(); setOpen(false) }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-red-400 hover:bg-neutral-700"
            >
              <Trash2 className="w-4 h-4" />
              Delete All Panels
            </button>
          </div>
        </div>
      )}
    </div>
  )
}