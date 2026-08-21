import { AppShell } from './components/layout/AppShell'
import { Dashboard } from './components/modules/Dashboard'
import { CharactersModule } from './components/modules/characters/CharactersModule'

function App() {
  return (
    <AppShell>
      {(activeModule) => {
        switch (activeModule) {
          case 'dashboard':
            return <Dashboard />
          case 'characters':
            return <CharactersModule />
          case 'manuscript':
          case 'locations':
            return <div className="text-neutral-500 text-sm">{activeModule} module coming next.</div>
        }
      }}
    </AppShell>
  )
}

export default App