import { AppShell } from './components/layout/AppShell'

function App() {
  return (
    <AppShell>
      {(activeModule) => (
        <div className="text-neutral-300">
          <h1 className="text-xl font-medium capitalize">{activeModule}</h1>
          <p className="text-sm text-neutral-500 mt-2">Module content will render here.</p>
        </div>
      )}
    </AppShell>
  )
}

export default App