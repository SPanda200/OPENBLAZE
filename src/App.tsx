import { AppShell } from './components/layout/AppShell'
import { Dashboard } from './components/modules/Dashboard'
import { CharactersModule } from './components/modules/characters/CharactersModule'
import { LocationsModule } from './components/modules/locations/LocationsModule'

function App() {
  return (
    <AppShell>
      {(activeModule) => {
        switch (activeModule) {
          case 'dashboard':
            return <Dashboard />
          case 'characters':
            return <CharactersModule />
          case 'locations':
            return <LocationsModule />
          case 'manuscript':
            return <div className="text-neutral-500 text-sm">Manuscript module coming next.</div>
        }
      }}
    </AppShell>
  )
}

export default App