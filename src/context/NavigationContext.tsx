// src/context/NavigationContext.tsx
import { createContext, useCallback, useContext, useState } from 'react'
import type { ReactNode } from 'react'
import type { ModuleKey } from '../types/navigation'
import { useUnsavedChanges } from './UnsavedChangesContext'

interface PendingTarget {
  moduleKey: ModuleKey
  entityId: string
}

interface NavigationContextValue {
  activeModule: ModuleKey
  setActiveModule: (key: ModuleKey) => void
  pendingTarget: PendingTarget | null
  navigateToEntity: (moduleKey: ModuleKey, entityId: string) => void
  clearPendingTarget: () => void
}

const NavigationContext = createContext<NavigationContextValue | undefined>(undefined)

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [activeModule, setActiveModuleState] = useState<ModuleKey>('dashboard')
  const [pendingTarget, setPendingTarget] = useState<PendingTarget | null>(null)
  const { guardNavigation } = useUnsavedChanges()

  const setActiveModule = useCallback(
    (key: ModuleKey) => guardNavigation(() => setActiveModuleState(key)),
    [guardNavigation]
  )

  const navigateToEntity = useCallback(
    (moduleKey: ModuleKey, entityId: string) => {
      guardNavigation(() => {
        setPendingTarget({ moduleKey, entityId })
        setActiveModuleState(moduleKey)
      })
    },
    [guardNavigation]
  )

  const clearPendingTarget = useCallback(() => setPendingTarget(null), [])

  return (
    <NavigationContext.Provider value={{ activeModule, setActiveModule, pendingTarget, navigateToEntity, clearPendingTarget }}>
      {children}
    </NavigationContext.Provider>
  )
}

export function useNavigation() {
  const ctx = useContext(NavigationContext)
  if (!ctx) throw new Error('useNavigation must be used within NavigationProvider')
  return ctx
}