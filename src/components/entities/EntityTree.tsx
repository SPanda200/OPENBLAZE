// src/components/entities/EntityTree.tsx
import { useState } from 'react'
import { ChevronRight, ChevronDown, Plus } from 'lucide-react'
import type { EntityTreeNode } from '../../utils/buildEntityTree'

interface EntityTreeProps {
  nodes: EntityTreeNode[]
  selectedFileName: string | null
  onSelect: (fileName: string) => void
  onAddChild: (parentId: string) => void
  icon: React.ElementType
  depth?: number
}

export function EntityTree({ nodes, selectedFileName, onSelect, onAddChild, icon, depth = 0 }: EntityTreeProps) {
  const list = (
    <div>
      {nodes.map((node) => (
        <EntityTreeItem key={node.entity.data.id} node={node} selectedFileName={selectedFileName} onSelect={onSelect} onAddChild={onAddChild} icon={icon} depth={depth} />
      ))}
    </div>
  )
  if (depth === 0) return list
  return <div className="ml-[9px] border-l border-neutral-800/70">{list}</div>
}

function EntityTreeItem({ node, selectedFileName, onSelect, onAddChild, icon: Icon, depth }: {
  node: EntityTreeNode; selectedFileName: string | null; onSelect: (fileName: string) => void
  onAddChild: (parentId: string) => void; icon: React.ElementType; depth: number
}) {
  const [expanded, setExpanded] = useState(true)
  const hasChildren = node.children.length > 0
  const isSelected = node.entity.fileName === selectedFileName

  return (
    <div>
      <div
        className={`group flex items-center gap-1 pr-2 py-[3px] text-[13px] leading-tight cursor-pointer transition-colors duration-100 ${isSelected ? 'bg-orange-600/10 text-orange-400' : 'text-neutral-300 hover:bg-neutral-800/70'}`}
        style={{ paddingLeft: `${depth === 0 ? 8 : 6}px` }}
      >
        <button onClick={() => setExpanded((e) => !e)} className={`shrink-0 w-3.5 h-3.5 flex items-center justify-center text-neutral-500 ${!hasChildren ? 'invisible' : ''}`}>
          {expanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
        </button>
        <div className="flex-1 flex items-center gap-1.5 min-w-0" onClick={() => onSelect(node.entity.fileName)}>
          <Icon className="w-3 h-3 shrink-0 opacity-50" />
          <span className="truncate">{node.entity.data.name || 'Untitled'}</span>
        </div>
        <button onClick={() => onAddChild(node.entity.data.id)} className="opacity-0 group-hover:opacity-100 shrink-0 text-neutral-500 hover:text-orange-400 p-0.5" title="Add nested entry">
          <Plus className="w-3 h-3" />
        </button>
      </div>
      {expanded && hasChildren && <EntityTree nodes={node.children} selectedFileName={selectedFileName} onSelect={onSelect} onAddChild={onAddChild} icon={Icon} depth={depth + 1} />}
    </div>
  )
}