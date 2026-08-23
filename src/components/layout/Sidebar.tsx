// src/components/layout/Sidebar.tsx
import { useState } from 'react'
import { LayoutDashboard, BookOpen, Users, Map, PanelLeftClose, PanelLeftOpen, Flame } from 'lucide-react'

export type ModuleKey = 'dashboard' | 'manuscript' | 'characters' | 'locations'

const NAV_ITEMS: { key: ModuleKey; label: string; icon: React.ElementType }[] = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'manuscript', label: 'Manuscript', icon: BookOpen },
  { key: 'characters', label: 'Characters', icon: Users },
  { key: 'locations', label: 'Locations', icon: Map },
]

interface SidebarProps {
  active: ModuleKey
  onSelect: (key: ModuleKey) => void
}

export function Sidebar({ active, onSelect }: SidebarProps) {
  const [pinned, setPinned] = useState(false)
  const [hovering, setHovering] = useState(false)
  const [suppressHover, setSuppressHover] = useState(false)

  const expanded = pinned || (hovering && !suppressHover)

  const handleSelect = (key: ModuleKey) => {
    onSelect(key)
    if (!pinned) setSuppressHover(true) // collapse right away, even mid-hover
  }

  const handleMouseLeave = () => {
    setHovering(false)
    setSuppressHover(false) // next hover-in works normally again
  }

  return (
    <aside
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={handleMouseLeave}
      className={`relative shrink-0 h-screen bg-neutral-900 text-neutral-200 flex flex-col border-r border-neutral-800 transition-[width] duration-150 ease-in-out overflow-hidden ${
        expanded ? 'w-60' : 'w-14'
      }`}
    >
      <div className="flex items-center justify-between px-3 h-14 shrink-0 border-b border-neutral-800">
        <div className="flex items-center gap-2 min-w-0">
          <Flame className="w-5 h-5 text-orange-500 shrink-0" />
          <span
            className={`text-base font-semibold whitespace-nowrap transition-opacity duration-150 ${
              expanded ? 'opacity-100' : 'opacity-0'
            }`}
          >
            OpenBlaze
          </span>
        </div>
        <button
          onClick={() => setPinned((p) => !p)}
          className={`shrink-0 text-neutral-500 hover:text-neutral-200 p-1 transition-opacity duration-150 ${
            expanded ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
          title={pinned ? 'Unpin sidebar' : 'Pin sidebar open'}
        >
          {pinned ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeftOpen className="w-4 h-4" />}
        </button>
      </div>

      <nav className="flex-1 px-2 py-3 space-y-1">
        {NAV_ITEMS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => handleSelect(key)}
            title={label}
            className={`w-full flex items-center gap-3 px-2.5 py-2 rounded-md text-sm transition-colors duration-100 whitespace-nowrap ${
              active === key
                ? 'bg-orange-600/20 text-orange-400'
                : 'text-neutral-400 hover:bg-neutral-800 hover:text-neutral-100'
            }`}
          >
            <Icon className="w-4 h-4 shrink-0" />
            <span className={`transition-opacity duration-150 ${expanded ? 'opacity-100' : 'opacity-0'}`}>
              {label}
            </span>
          </button>
        ))}
      </nav>
    </aside>
  )
}