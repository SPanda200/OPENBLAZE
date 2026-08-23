// src/context/UnsavedChangesContext.tsx
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { UnsavedChangesModal } from './UnsavedChangesModal'

interface Handlers {
  onSave: () => Promise<void>
}

interface UnsavedChangesContextValue {
  isDirty: boolean
  setDirty: (dirty: boolean) => void
  registerHandlers: (handlers: Handlers | null) => void
  guardNavigation: (proceed: () => void) => void
}

const UnsavedChangesContext = createContext<UnsavedChangesContextValue | undefined>(undefined)

export function UnsavedChangesProvider({ children }: { children: ReactNode }) {
  const [isDirty, setIsDirty] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  const handlersRef = useRef<Handlers | null>(null)
  const pendingActionRef = useRef<(() => void) | null>(null)

  const registerHandlers = useCallback((handlers: Handlers | null) => {
    handlersRef.current = handlers
  }, [])

  const guardNavigation = useCallback(
    (proceed: () => void) => {
      if (!isDirty) {
        proceed()
        return
      }
      pendingActionRef.current = proceed
      setModalOpen(true)
    },
    [isDirty]
  )

  const handleSave = async () => {
    if (!handlersRef.current) return
    setSaving(true)
    await handlersRef.current.onSave()
    setSaving(false)
    setIsDirty(false)
    setModalOpen(false)
    pendingActionRef.current?.()
    pendingActionRef.current = null
  }

  const handleDiscard = () => {
    setIsDirty(false)
    setModalOpen(false)
    pendingActionRef.current?.()
    pendingActionRef.current = null
  }

  const handleCancel = () => {
    setModalOpen(false)
    pendingActionRef.current = null
  }

  // Main process asks "is it safe to close?" — route that through the same guard
  useEffect(() => {
    const unsubscribe = window.electron.onBeforeClose(() => {
      guardNavigation(() => window.electron.confirmClose())
    })
    return unsubscribe
  }, [guardNavigation])

  return (
    <UnsavedChangesContext.Provider value={{ isDirty, setDirty: setIsDirty, registerHandlers, guardNavigation }}>
      {children}
      {modalOpen && (
        <UnsavedChangesModal saving={saving} onSave={handleSave} onDiscard={handleDiscard} onCancel={handleCancel} />
      )}
    </UnsavedChangesContext.Provider>
  )
}

export function useUnsavedChanges() {
  const ctx = useContext(UnsavedChangesContext)
  if (!ctx) throw new Error('useUnsavedChanges must be used within UnsavedChangesProvider')
  return ctx
}