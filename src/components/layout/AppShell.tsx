// src/components/layout/AppShell.tsx
import { useState } from 'react'
import { Sidebar } from './Sidebar'
import type { ModuleKey } from './Sidebar'

interface AppShellProps {
  children: (activeModule: ModuleKey) => React.ReactNode
}


export function AppShell({ children }: AppShellProps) {
  const [active, setActive] = useState<ModuleKey>('dashboard')

  return (
    <div className="flex h-screen w-screen bg-neutral-950 text-neutral-100 overflow-hidden">
      <Sidebar active={active} onSelect={setActive} />
      <main className="flex-1 overflow-y-auto overflow-x-hidden p-6 min-w-0">
        <div key={active} className="fade-in h-full">
          {children(active)}
        </div>
      </main>
    </div>
  )
}