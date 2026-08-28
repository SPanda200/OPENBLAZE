// src/components/shared/ExportMenu.tsx
import { useEffect, useRef, useState } from 'react'
import { Download, FileText, FileCode, FileType } from 'lucide-react'

export type ExportFormat = 'md' | 'txt' | 'docx'

interface ExportMenuProps {
  label?: string
  onExport: (format: ExportFormat) => void
}

const FORMAT_OPTIONS: { format: ExportFormat; label: string; icon: React.ElementType }[] = [
  { format: 'md', label: 'Markdown (.md)', icon: FileCode },
  { format: 'txt', label: 'Plain Text (.txt)', icon: FileText },
  { format: 'docx', label: 'Word Document (.docx)', icon: FileType },
]

export function ExportMenu({ label = 'Export', onExport }: ExportMenuProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClick = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen((o) => !o)} className="flex items-center gap-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-md px-3 py-2 text-sm">
        <Download className="w-4 h-4" />
        {label}
      </button>
      {open && (
        <div className="absolute right-0 top-11 z-20 w-52 bg-neutral-800 border border-neutral-700 rounded-md shadow-lg py-1 text-sm overflow-hidden">
          {FORMAT_OPTIONS.map(({ format, label, icon: Icon }) => (
            <button key={format} onClick={() => { onExport(format); setOpen(false) }} className="w-full flex items-center gap-2.5 px-3 py-2 text-neutral-300 hover:bg-neutral-700">
              <Icon className="w-4 h-4 text-neutral-500" />
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}