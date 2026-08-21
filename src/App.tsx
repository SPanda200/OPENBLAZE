// src/App.tsx
import { AppShell } from './components/layout/AppShell'
import { Dashboard } from './components/modules/Dashboard'

function App() {
  return (
    <AppShell>
      {(activeModule) => {
        switch (activeModule) {
          case 'dashboard':
            return <Dashboard />
          case 'manuscript':
          case 'characters':
          case 'locations':
            return (
              <div className="text-neutral-500 text-sm">
                {activeModule} module coming in Phase 2.
              </div>
            )
        }
      }}
    </AppShell>
  )
}

export default App