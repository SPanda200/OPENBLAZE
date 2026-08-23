// src/components/panels/PanelCard.tsx
import { useState, useRef, useEffect } from 'react'
import { MoreVertical, Trash2, Columns2, Square } from 'lucide-react'
import type { Panel } from '../../types/panel'
import { PanelBody } from './PanelBody'

interface PanelCardProps {
  panel: Panel
  onUpdate: (updates: Partial<Panel>) => void
  onDelete: () => void
}

export function PanelCard({ panel, onUpdate, onDelete }: PanelCardProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div className={`bg-neutral-900 border border-neutral-800 rounded-lg p-4 ${panel.width === 'full' ? 'col-span-2' : 'col-span-1'}`}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <input
          value={panel.title}
          onChange={(e) => onUpdate({ title: e.target.value })}
          className="text-base font-semibold bg-transparent outline-none text-neutral-100 min-w-0 flex-1"
        />
        <div className="relative shrink-0" ref={menuRef}>
          <button onClick={() => setMenuOpen((o) => !o)} className="text-neutral-600 hover:text-neutral-300 p-1">
            <MoreVertical className="w-4 h-4" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-7 z-10 w-44 bg-neutral-800 border border-neutral-700 rounded-md shadow-lg py-1 text-sm">
              <button
                onClick={() => { onUpdate({ width: panel.width === 'full' ? 'half' : 'full' }); setMenuOpen(false) }}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-neutral-300 hover:bg-neutral-700"
              >
                {panel.width === 'full' ? <Columns2 className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
                {panel.width === 'full' ? 'Make Half Width' : 'Make Full Width'}
              </button>
              <button
                onClick={() => { onDelete(); setMenuOpen(false) }}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-red-400 hover:bg-neutral-700"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete Panel
              </button>
            </div>
          )}
        </div>
      </div>
      <PanelBody panel={panel} onChange={(data) => onUpdate({ data })} />
    </div>
  )
}