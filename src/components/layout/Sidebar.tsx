// src/components/layout/Sidebar.tsx
import { useState } from 'react'
import { LayoutDashboard, BookOpen, PanelLeftClose, PanelLeftOpen, Flame, Settings, Search } from 'lucide-react'
import { useEntityTypes } from '../../context/EntityTypesContext'
import { getIconComponent } from '../../config/iconOptions'
import type { ModuleKey } from '../../types/navigation'
export type { ModuleKey } from '../../types/navigation'

interface SidebarProps {
  active: ModuleKey
  onSelect: (key: ModuleKey) => void
  onManageTypes: () => void
  onSearch: () => void
}

export function Sidebar({ active, onSelect, onManageTypes, onSearch }: SidebarProps) {
  const [pinned, setPinned] = useState(false)
  const [hovering, setHovering] = useState(false)
  const [suppressHover, setSuppressHover] = useState(false)
  const { entityTypes } = useEntityTypes()
  const expanded = pinned || (hovering && !suppressHover)

  const handleSelect = (key: ModuleKey) => { onSelect(key); if (!pinned) setSuppressHover(true) }
  const handleMouseLeave = () => { setHovering(false); setSuppressHover(false) }

  return (
    <aside onMouseEnter={() => setHovering(true)} onMouseLeave={handleMouseLeave}
      className={`relative shrink-0 h-screen bg-neutral-900 text-neutral-200 flex flex-col border-r border-neutral-800 transition-[width] duration-150 ease-in-out overflow-hidden ${expanded ? 'w-60' : 'w-14'}`}>
      <div className="flex items-center justify-between px-3 h-14 shrink-0 border-b border-neutral-800">
        <div className="flex items-center gap-2 min-w-0">
          <Flame className="w-5 h-5 text-orange-500 shrink-0" />
          <span className={`text-base font-semibold whitespace-nowrap transition-opacity duration-150 ${expanded ? 'opacity-100' : 'opacity-0'}`}>OpenBlaze</span>
        </div>
        <button onClick={() => setPinned((p) => !p)} className={`shrink-0 text-neutral-500 hover:text-neutral-200 p-1 transition-opacity duration-150 ${expanded ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} title={pinned ? 'Unpin sidebar' : 'Pin sidebar open'}>
          {pinned ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeftOpen className="w-4 h-4" />}
        </button>
      </div>

      <div className="px-2 pt-2">
        <NavButton active={false} icon={Search} label="Search  (Ctrl+K)" expanded={expanded} onClick={onSearch} />
      </div>

      <nav className="flex-1 px-2 py-3 space-y-1 overflow-y-auto overflow-x-hidden">
        <NavButton active={active === 'dashboard'} icon={LayoutDashboard} label="Dashboard" expanded={expanded} onClick={() => handleSelect('dashboard')} />
        <NavButton active={active === 'manuscript'} icon={BookOpen} label="Manuscript" expanded={expanded} onClick={() => handleSelect('manuscript')} />
        <div className="pt-2 mt-2 border-t border-neutral-800/60">
          {entityTypes.map((type) => (
            <NavButton key={type.id} active={active === type.id} icon={getIconComponent(type.icon)} label={type.pluralLabel} expanded={expanded} onClick={() => handleSelect(type.id)} />
          ))}
        </div>
      </nav>

      <div className="px-2 py-3 border-t border-neutral-800">
        <NavButton active={false} icon={Settings} label="Entity Types" expanded={expanded} onClick={onManageTypes} />
      </div>
    </aside>
  )
}

function NavButton({ active, icon: Icon, label, expanded, onClick }: { active: boolean; icon: React.ElementType; label: string; expanded: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} title={label} className={`w-full flex items-center gap-3 px-2.5 py-2 rounded-md text-sm transition-colors duration-100 whitespace-nowrap ${active ? 'bg-orange-600/20 text-orange-400' : 'text-neutral-400 hover:bg-neutral-800 hover:text-neutral-100'}`}>
      <Icon className="w-4 h-4 shrink-0" />
      <span className={`transition-opacity duration-150 ${expanded ? 'opacity-100' : 'opacity-0'}`}>{label}</span>
    </button>
  )
}
