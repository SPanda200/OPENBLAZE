// src/main.tsx
import { EntityTypesProvider } from './context/EntityTypesContext'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { VaultProvider } from './context/VaultContext'
import { UnsavedChangesProvider } from './context/UnsavedChangesContext'
import { EntityRegistryProvider } from './context/EntityRegistryContext'
import { NavigationProvider } from './context/NavigationContext'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <VaultProvider>
      <UnsavedChangesProvider>
        <EntityTypesProvider>
          <EntityRegistryProvider>
            <NavigationProvider>
              <App />
            </NavigationProvider>
          </EntityRegistryProvider>
        </EntityTypesProvider>
      </UnsavedChangesProvider>
    </VaultProvider>
  </StrictMode>,
)