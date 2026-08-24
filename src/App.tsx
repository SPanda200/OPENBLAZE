// src/App.tsx
import { AppShell } from './components/layout/AppShell'
import { Dashboard } from './components/modules/Dashboard'
import { EntityModule } from './components/entities/EntityModule'
import { ManuscriptModule } from './components/manuscript/ManuscriptModule'
import { useEntityTypes } from './context/EntityTypesContext'

function App() {
  const { entityTypes } = useEntityTypes()
  return (
    <AppShell>
      {(activeModule) => {
        if (activeModule === 'dashboard') return <Dashboard />
        if (activeModule === 'manuscript') return <ManuscriptModule />
        const entityType = entityTypes.find((t) => t.id === activeModule)
        if (!entityType) return <div className="text-neutral-600 text-sm">Select something from the sidebar.</div>
        return <EntityModule entityType={entityType} />
      }}
    </AppShell>
  )
}
export default App