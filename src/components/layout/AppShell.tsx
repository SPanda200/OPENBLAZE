// src/components/layout/AppShell.tsx
import { useEffect, useState } from 'react'
import { Sidebar } from './Sidebar'
import type { ModuleKey } from './Sidebar'
import { useNavigation } from '../../context/NavigationContext'
import { ManageEntityTypesModal } from '../entities/ManageEntityTypesModal'
import { SearchModal } from '../search/SearchModal'

export function AppShell({ children }: { children: (activeModule: ModuleKey) => React.ReactNode }) {
  const { activeModule, setActiveModule } = useNavigation()
  const [manageOpen, setManageOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setSearchOpen(true)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  return (
    <div className="flex h-screen w-screen bg-neutral-950 text-neutral-100 overflow-hidden">
      <Sidebar active={activeModule} onSelect={setActiveModule} onManageTypes={() => setManageOpen(true)} onSearch={() => setSearchOpen(true)} />
      <main className="flex-1 overflow-y-auto overflow-x-hidden p-6 min-w-0">
        <div key={activeModule} className="fade-in h-full">{children(activeModule)}</div>
      </main>
      {manageOpen && <ManageEntityTypesModal onClose={() => setManageOpen(false)} />}
      {searchOpen && <SearchModal onClose={() => setSearchOpen(false)} />}
    </div>
  )
}