// src/main.tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { VaultProvider } from './context/VaultContext'
import { UnsavedChangesProvider } from './context/UnsavedChangesContext'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <VaultProvider>
      <UnsavedChangesProvider>
        <App />
      </UnsavedChangesProvider>
    </VaultProvider>
  </StrictMode>,
)