// src/templates/panelTemplates.ts
import type { Panel } from '../types/panel'

function panel(partial: Omit<Panel, 'id'>): Panel {
  return { id: `panel_${Math.random().toString(36).slice(2, 10)}`, ...partial }
}

export const characterPanelTemplate = (): Panel[] => [
  panel({ type: 'text', title: 'Overview', width: 'full', data: { text: '' } }),
  panel({
    type: 'attributes', title: 'Basic Information', width: 'half',
    data: { attributes: [
      { label: 'Age', value: '' },
      { label: 'Role', value: '' },
      { label: 'Species', value: '' },
    ] },
  }),
  panel({ type: 'text', title: 'Personality', width: 'half', data: { text: '' } }),
  panel({ type: 'table', title: 'Relationships', width: 'full', data: { columns: ['Name', 'Relation'], rows: [] } }),
]

export const locationPanelTemplate = (): Panel[] => [
  panel({
    type: 'attributes', title: 'Location Details', width: 'half',
    data: { attributes: [
      { label: 'Location Type', value: '' },
      { label: 'Location Age', value: '' },
      { label: 'Created/Built by', value: '' },
      { label: 'Date Created/Built', value: '' },
      { label: 'Purpose of Construction', value: '' },
    ] },
  }),
  panel({ type: 'text', title: 'Overview', width: 'half', data: { text: '' } }),
  panel({ type: 'text', title: 'Geography', width: 'half', data: { text: '' } }),
  panel({
    type: 'attributes', title: 'Basic Information', width: 'half',
    data: { attributes: [
      { label: 'Area', value: '' },
      { label: 'Population', value: '' },
      { label: 'Climate', value: '' },
      { label: 'Natural Resources', value: '' },
    ] },
  }),
]