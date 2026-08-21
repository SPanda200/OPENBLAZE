import { useState } from 'react'
import { Sidebar, ModuleKey } from './Sidebar'

interface AppShellProps {
  children: (activeModule: ModuleKey) => React.ReactNode
}

export function AppShell({ children }: AppShellProps) {
  const [active, setActive] = useState<ModuleKey>('dashboard')

  return (
    <div className="flex h-screen bg-neutral-950 text-neutral-100">
      <Sidebar active={active} onSelect={setActive} />
      <main className="flex-1 overflow-y-auto p-6">{children(active)}</main>
    </div>
  )
}