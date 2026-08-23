// src/components/modules/locations/LocationTree.tsx
import { useState } from 'react'
import { ChevronRight, ChevronDown, MapPin, Plus } from 'lucide-react'
import type { LocationTreeNode } from '../../../utils/buildLocationTree'

interface LocationTreeProps {
  nodes: LocationTreeNode[]
  selectedFileName: string | null
  onSelect: (fileName: string) => void
  onAddChild: (parentId: string) => void
  depth?: number
}

export function LocationTree({ nodes, selectedFileName, onSelect, onAddChild, depth = 0 }: LocationTreeProps) {
  const list = (
    <div>
      {nodes.map((node) => (
        <LocationTreeItem
          key={node.location.data.id}
          node={node}
          selectedFileName={selectedFileName}
          onSelect={onSelect}
          onAddChild={onAddChild}
          depth={depth}
        />
      ))}
    </div>
  )

  // Nested levels get a thin vertical guide line — cascades naturally with recursion
  if (depth === 0) return list
  return <div className="ml-[9px] border-l border-neutral-800/70">{list}</div>
}

function LocationTreeItem({
  node,
  selectedFileName,
  onSelect,
  onAddChild,
  depth,
}: {
  node: LocationTreeNode
  selectedFileName: string | null
  onSelect: (fileName: string) => void
  onAddChild: (parentId: string) => void
  depth: number
}) {
  const [expanded, setExpanded] = useState(true)
  const hasChildren = node.children.length > 0
  const isSelected = node.location.fileName === selectedFileName

  return (
    <div>
      <div
        className={`group flex items-center gap-1 pr-2 py-[3px] text-[13px] leading-tight cursor-pointer transition-colors duration-100 ${
          isSelected ? 'bg-orange-600/10 text-orange-400' : 'text-neutral-300 hover:bg-neutral-800/70'
        }`}
        style={{ paddingLeft: `${depth === 0 ? 8 : 6}px` }}
      >
        <button
          onClick={() => setExpanded((e) => !e)}
          className={`shrink-0 w-3.5 h-3.5 flex items-center justify-center text-neutral-500 ${
            !hasChildren ? 'invisible' : ''
          }`}
        >
          {expanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
        </button>

        <div className="flex-1 flex items-center gap-1.5 min-w-0" onClick={() => onSelect(node.location.fileName)}>
          <MapPin className="w-3 h-3 shrink-0 opacity-50" />
          <span className="truncate">{node.location.data.name || 'Untitled'}</span>
        </div>

        <button
          onClick={() => onAddChild(node.location.data.id)}
          className="opacity-0 group-hover:opacity-100 shrink-0 text-neutral-500 hover:text-orange-400 p-0.5"
          title="Add nested location"
        >
          <Plus className="w-3 h-3" />
        </button>
      </div>

      {expanded && hasChildren && (
        <LocationTree
          nodes={node.children}
          selectedFileName={selectedFileName}
          onSelect={onSelect}
          onAddChild={onAddChild}
          depth={depth + 1}
        />
      )}
    </div>
  )
}