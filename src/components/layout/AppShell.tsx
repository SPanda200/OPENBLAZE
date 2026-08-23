// src/components/layout/AppShell.tsx
import { Sidebar } from './Sidebar'
import type { ModuleKey } from './Sidebar'
import { useNavigation } from '../../context/NavigationContext'

interface AppShellProps {
  children: (activeModule: ModuleKey) => React.ReactNode
}

export function AppShell({ children }: AppShellProps) {
  const { activeModule, setActiveModule } = useNavigation()

  return (
    <div className="flex h-screen w-screen bg-neutral-950 text-neutral-100 overflow-hidden">
      <Sidebar active={activeModule} onSelect={setActiveModule} />
      <main className="flex-1 overflow-y-auto overflow-x-hidden p-6 min-w-0">
        <div key={activeModule} className="fade-in h-full">
          {children(activeModule)}
        </div>
      </main>
    </div>
  )
}