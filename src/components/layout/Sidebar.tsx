import { LayoutDashboard, BookOpen, Users, Map } from 'lucide-react'

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
  return (
    <aside className="w-60 shrink-0 h-screen bg-neutral-900 text-neutral-200 flex flex-col border-r border-neutral-800">
      <div className="px-4 py-5 text-lg font-semibold tracking-wide border-b border-neutral-800">
        OpenBlaze
      </div>
      <nav className="flex-1 px-2 py-4 space-y-1">
        {NAV_ITEMS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => onSelect(key)}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
              active === key
                ? 'bg-orange-600/20 text-orange-400'
                : 'text-neutral-400 hover:bg-neutral-800 hover:text-neutral-100'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </nav>
    </aside>
  )
}