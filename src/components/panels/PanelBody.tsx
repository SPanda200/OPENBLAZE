import { useEffect, useState } from 'react'
import { Plus, Trash2, Image as ImageIcon, Upload } from 'lucide-react'
import type {
  Panel, AnyPanelData, TextPanelData, ListPanelData, StatsPanelData,
  TablePanelData, ImagePanelData, LinksPanelData, AttributesPanelData,
} from '../../types/panel'
import { useNavigation } from '../../context/NavigationContext'
import { useEntityRegistry } from '../../context/EntityRegistryContext'
import { EntityPicker } from './EntityPicker'
import { useLinkableTextarea } from '../../hooks/useLinkableTextarea'
import { LinkedText } from '../shared/LinkedText'
import { useVault } from '../../context/VaultContext'

interface PanelBodyProps {
  panel: Panel
  onChange: (data: AnyPanelData) => void
}

export function PanelBody({ panel, onChange }: PanelBodyProps) {
  switch (panel.type) {
    case 'text': return <TextBody data={panel.data as TextPanelData} onChange={onChange} />
    case 'list': return <ListBody data={panel.data as ListPanelData} onChange={onChange} />
    case 'stats': return <StatsBody data={panel.data as StatsPanelData} onChange={onChange} />
    case 'table': return <TableBody data={panel.data as TablePanelData} onChange={onChange} />
    case 'image': return <ImageBody data={panel.data as ImagePanelData} onChange={onChange} />
    case 'links': return <LinksBody data={panel.data as LinksPanelData} onChange={onChange} />
    case 'attributes': return <AttributesBody data={panel.data as AttributesPanelData} onChange={onChange} />
  }
}

function TextBody({ data, onChange }: { data: TextPanelData; onChange: (d: TextPanelData) => void }) {
  const [editing, setEditing] = useState(false)
  const { navigateToEntity } = useNavigation()
  const { entities } = useEntityRegistry()
  const { textareaRef, pickerOpen, pickerQuery, highlightedIndex, anchorRect, handleChange, handleKeyDown, insertLink, closePicker } =
    useLinkableTextarea({ value: data.text, onChange: (text) => onChange({ text }) })

  if (!editing) {
    return (
      <div onClick={() => setEditing(true)} className="min-h-[80px] cursor-text text-sm text-neutral-300 leading-relaxed whitespace-pre-wrap">
        {data.text ? (
          <LinkedText text={data.text} entities={entities} onLinkClick={navigateToEntity} />
        ) : (
          <span className="text-neutral-600">Click to add notes — type @ to link a character, location, or other entry.</span>
        )}
      </div>
    )
  }

  return (
    <div className="relative">
      <textarea
        ref={textareaRef}
        autoFocus
        value={data.text}
        onChange={(e) => handleChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => { setEditing(false); closePicker() }}
        placeholder="Type here... use @ to link a character, location, or other entry"
        rows={5}
        className="w-full bg-transparent text-sm text-neutral-300 placeholder-neutral-600 outline-none resize-y leading-relaxed"
      />
      {pickerOpen && <EntityPicker query={pickerQuery} highlightedIndex={highlightedIndex} onSelect={insertLink} anchorRect={anchorRect} />}
    </div>
  )
}

function AttributesBody({ data, onChange }: { data: AttributesPanelData; onChange: (d: AttributesPanelData) => void }) {
  const update = (i: number, field: 'label' | 'value', val: string) =>
    onChange({ attributes: data.attributes.map((a, idx) => (idx === i ? { ...a, [field]: val } : a)) })
  const addRow = () => onChange({ attributes: [...data.attributes, { label: 'New Field', value: '' }] })
  const removeRow = (i: number) => onChange({ attributes: data.attributes.filter((_, idx) => idx !== i) })

  return (
    <div className="space-y-1.5">
      {data.attributes.map((attr, i) => (
        <div key={i} className="flex items-center gap-2 group">
          <input value={attr.label} onChange={(e) => update(i, 'label', e.target.value)} className="text-sm font-semibold text-neutral-200 bg-transparent outline-none w-36 shrink-0 truncate focus:text-orange-400" />
          <span className="text-neutral-600">:</span>
          <input value={attr.value} onChange={(e) => update(i, 'value', e.target.value)} placeholder="—" className="text-sm text-neutral-400 bg-transparent outline-none flex-1 min-w-0" />
          <button onClick={() => removeRow(i)} className="opacity-0 group-hover:opacity-100 text-neutral-600 hover:text-red-500">
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      ))}
      <button onClick={addRow} className="flex items-center gap-1 text-xs text-neutral-600 hover:text-orange-400 mt-2">
        <Plus className="w-3 h-3" /> Add field
      </button>
    </div>
  )
}

function ListBody({ data, onChange }: { data: ListPanelData; onChange: (d: ListPanelData) => void }) {
  const update = (i: number, val: string) => onChange({ items: data.items.map((it, idx) => (idx === i ? val : it)) })
  const addItem = () => onChange({ items: [...data.items, ''] })
  const removeItem = (i: number) => onChange({ items: data.items.filter((_, idx) => idx !== i) })

  return (
    <div className="space-y-1">
      {data.items.map((item, i) => (
        <div key={i} className="flex items-center gap-2 group">
          <span className="text-neutral-600 text-sm">•</span>
          <input value={item} onChange={(e) => update(i, e.target.value)} placeholder="List item..." className="text-sm text-neutral-300 bg-transparent outline-none flex-1" />
          <button onClick={() => removeItem(i)} className="opacity-0 group-hover:opacity-100 text-neutral-600 hover:text-red-500">
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      ))}
      <button onClick={addItem} className="flex items-center gap-1 text-xs text-neutral-600 hover:text-orange-400 mt-1">
        <Plus className="w-3 h-3" /> Add item
      </button>
    </div>
  )
}

function StatsBody({ data, onChange }: { data: StatsPanelData; onChange: (d: StatsPanelData) => void }) {
  const update = (i: number, field: 'label' | 'value', val: string) =>
    onChange({ stats: data.stats.map((s, idx) => (idx === i ? { ...s, [field]: val } : s)) })
  const addStat = () => onChange({ stats: [...data.stats, { label: 'Stat', value: '0' }] })
  const removeStat = (i: number) => onChange({ stats: data.stats.filter((_, idx) => idx !== i) })

  return (
    <div className="grid grid-cols-2 gap-3">
      {data.stats.map((s, i) => (
        <div key={i} className="group relative bg-neutral-800/50 rounded-md p-2">
          <input value={s.value} onChange={(e) => update(i, 'value', e.target.value)} className="text-lg font-semibold text-orange-400 bg-transparent outline-none w-full" />
          <input value={s.label} onChange={(e) => update(i, 'label', e.target.value)} className="text-xs text-neutral-500 bg-transparent outline-none w-full" />
          <button onClick={() => removeStat(i)} className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 text-neutral-600 hover:text-red-500">
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      ))}
      <button onClick={addStat} className="flex items-center justify-center gap-1 text-xs text-neutral-600 hover:text-orange-400 border border-dashed border-neutral-800 rounded-md p-2">
        <Plus className="w-3 h-3" /> Add stat
      </button>
    </div>
  )
}

function TableBody({ data, onChange }: { data: TablePanelData; onChange: (d: TablePanelData) => void }) {
  const updateHeader = (i: number, val: string) => onChange({ ...data, columns: data.columns.map((c, idx) => (idx === i ? val : c)) })
  const updateCell = (r: number, c: number, val: string) => {
    const rows = data.rows.map((row, ri) => (ri === r ? row.map((cell, ci) => (ci === c ? val : cell)) : row))
    onChange({ ...data, rows })
  }
  const addColumn = () => onChange({ columns: [...data.columns, 'New Column'], rows: data.rows.map((r) => [...r, '']) })
  const addRow = () => onChange({ ...data, rows: [...data.rows, data.columns.map(() => '')] })
  const removeRow = (r: number) => onChange({ ...data, rows: data.rows.filter((_, idx) => idx !== r) })

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr>
            {data.columns.map((col, i) => (
              <th key={i} className="text-left border-b border-neutral-800 pb-1.5">
                <input value={col} onChange={(e) => updateHeader(i, e.target.value)} className="bg-transparent text-xs uppercase tracking-wide text-neutral-500 outline-none w-full" />
              </th>
            ))}
            <th className="w-6" />
          </tr>
        </thead>
        <tbody>
          {data.rows.map((row, r) => (
            <tr key={r} className="group">
              {row.map((cell, c) => (
                <td key={c} className="py-1 pr-2">
                  <input value={cell} onChange={(e) => updateCell(r, c, e.target.value)} className="bg-transparent text-neutral-300 outline-none w-full" />
                </td>
              ))}
              <td>
                <button onClick={() => removeRow(r)} className="opacity-0 group-hover:opacity-100 text-neutral-600 hover:text-red-500">
                  <Trash2 className="w-3 h-3" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex gap-3 mt-2">
        <button onClick={addRow} className="flex items-center gap-1 text-xs text-neutral-600 hover:text-orange-400">
          <Plus className="w-3 h-3" /> Row
        </button>
        <button onClick={addColumn} className="flex items-center gap-1 text-xs text-neutral-600 hover:text-orange-400">
          <Plus className="w-3 h-3" /> Column
        </button>
      </div>
    </div>
  )
}

function ImageBody({ data, onChange }: { data: ImagePanelData; onChange: (d: ImagePanelData) => void }) {
  const { vaultPath } = useVault()
  const [resolvedSrc, setResolvedSrc] = useState<string | null>(null)
  const [importing, setImporting] = useState(false)
  const [dragActive, setDragActive] = useState(false)

  // Pasted external URLs render directly; vault-relative paths (imported files)
  // resolve through the openblaze-asset:// protocol, which is async.
  useEffect(() => {
    let cancelled = false
    async function resolve() {
      if (!data.imageUrl) { setResolvedSrc(null); return }
      if (/^https?:\/\//i.test(data.imageUrl)) { setResolvedSrc(data.imageUrl); return }
      if (!vaultPath) { setResolvedSrc(null); return }
      const url = await window.electron.getAssetUrl(vaultPath, data.imageUrl)
      if (!cancelled) setResolvedSrc(url)
    }
    resolve()
    return () => { cancelled = true }
  }, [data.imageUrl, vaultPath])

  const handleBrowse = async () => {
    if (!vaultPath) return
    setImporting(true)
    const result = await window.electron.importImage(vaultPath)
    setImporting(false)
    if (result?.success && result.relativePath) onChange({ ...data, imageUrl: result.relativePath })
    else if (result && !result.success) window.alert(`Couldn't import image: ${result.error ?? 'unknown error'}`)
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
    if (!vaultPath) return
    const file = e.dataTransfer.files[0] as (File & { path?: string }) | undefined
    if (!file?.path) return
    setImporting(true)
    const result = await window.electron.importImageFromPath(vaultPath, file.path)
    setImporting(false)
    if (result.success && result.relativePath) onChange({ ...data, imageUrl: result.relativePath })
    else if (!result.success) window.alert(`Couldn't import image: ${result.error ?? 'unknown error'}`)
  }

  return (
    <div className="space-y-2">
      <div
        onDragOver={(e) => { e.preventDefault(); setDragActive(true) }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        className={`rounded-md border transition-colors ${dragActive ? 'border-orange-500 bg-orange-600/5' : 'border-neutral-800'}`}
      >
        {resolvedSrc ? (
          <img src={resolvedSrc} alt={data.caption} className="w-full rounded-md object-cover max-h-64" />
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 py-10 text-neutral-600 text-xs">
            <ImageIcon className="w-6 h-6" />
            Drag an image here, or browse
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button onClick={handleBrowse} disabled={importing} className="flex items-center gap-1.5 text-xs bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 text-neutral-300 rounded px-2.5 py-1.5">
          <Upload className="w-3 h-3" />
          {importing ? 'Importing...' : 'Browse...'}
        </button>
        {data.imageUrl && (
          <button onClick={() => onChange({ ...data, imageUrl: '' })} className="text-xs text-neutral-600 hover:text-red-500">
            Remove
          </button>
        )}
      </div>

      <input
        value={data.caption}
        onChange={(e) => onChange({ ...data, caption: e.target.value })}
        placeholder="Caption..."
        className="w-full text-xs bg-transparent text-neutral-500 outline-none"
      />
    </div>
  )
}

function LinksBody({ data, onChange }: { data: LinksPanelData; onChange: (d: LinksPanelData) => void }) {
  const update = (i: number, field: 'label' | 'url', val: string) =>
    onChange({ links: data.links.map((l, idx) => (idx === i ? { ...l, [field]: val } : l)) })
  const addLink = () => onChange({ links: [...data.links, { label: 'New Link', url: '' }] })
  const removeLink = (i: number) => onChange({ links: data.links.filter((_, idx) => idx !== i) })

  return (
    <div className="space-y-1.5">
      {data.links.map((link, i) => (
        <div key={i} className="flex items-center gap-2 group">
          <input value={link.label} onChange={(e) => update(i, 'label', e.target.value)} className="text-sm text-orange-400 bg-transparent outline-none w-28 shrink-0 truncate" />
          <input value={link.url} onChange={(e) => update(i, 'url', e.target.value)} placeholder="https://..." className="text-sm text-neutral-500 bg-transparent outline-none flex-1" />
          <button onClick={() => removeLink(i)} className="opacity-0 group-hover:opacity-100 text-neutral-600 hover:text-red-500">
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      ))}
      <button onClick={addLink} className="flex items-center gap-1 text-xs text-neutral-600 hover:text-orange-400 mt-1">
        <Plus className="w-3 h-3" /> Add link
      </button>
    </div>
  )
}