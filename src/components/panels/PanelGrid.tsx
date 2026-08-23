// src/components/panels/PanelGrid.tsx
import type { Panel, PanelType } from '../../types/panel'
import { createEmptyPanelData } from '../../types/panel'
import { PanelCard } from './PanelCard'
import { AddPanelMenu } from './AddPanelMenu'

interface PanelGridProps {
  panels: Panel[]
  onChange: (panels: Panel[]) => void
}

export function PanelGrid({ panels, onChange }: PanelGridProps) {
  const addPanel = (type: PanelType) => {
    const newPanel: Panel = {
      id: `panel_${Date.now()}`,
      type,
      title: 'New Panel',
      width: 'full',
      data: createEmptyPanelData(type),
    }
    onChange([...panels, newPanel])
  }

  const updatePanel = (id: string, updates: Partial<Panel>) =>
    onChange(panels.map((p) => (p.id === id ? ({ ...p, ...updates } as Panel) : p)))

  const deletePanel = (id: string) => onChange(panels.filter((p) => p.id !== id))
  const deleteAll = () => onChange([])

  return (
    <div>
      <div className="flex justify-end mb-3">
        <AddPanelMenu onAdd={addPanel} onDeleteAll={deleteAll} />
      </div>
      {panels.length === 0 ? (
        <div className="text-center text-neutral-600 text-sm py-16 border border-dashed border-neutral-800 rounded-lg">
          No panels yet — click "Add Panel" to start building this page.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {panels.map((panel) => (
            <PanelCard key={panel.id} panel={panel} onUpdate={(u) => updatePanel(panel.id, u)} onDelete={() => deletePanel(panel.id)} />
          ))}
        </div>
      )}
    </div>
  )
}