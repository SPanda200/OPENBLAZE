// src/components/entities/BacklinksPanel.tsx
import { Link2, BookOpen } from 'lucide-react'
import { useEntityRegistry } from '../../context/EntityRegistryContext'
import { useEntityTypes } from '../../context/EntityTypesContext'
import { useNavigation } from '../../context/NavigationContext'
import { getIconComponent } from '../../config/iconOptions'

interface BacklinksPanelProps {
  entityTypeId: string
  entityId: string
}

export function BacklinksPanel({ entityTypeId, entityId }: BacklinksPanelProps) {
  const { getBacklinks } = useEntityRegistry()
  const { entityTypes } = useEntityTypes()
  const { navigateToEntity } = useNavigation()
  const backlinks = getBacklinks(entityTypeId, entityId)

  if (backlinks.length === 0) return null

  const iconFor = (sourceEntityTypeId: string) => {
    if (sourceEntityTypeId === 'manuscript') return BookOpen
    const type = entityTypes.find((t) => t.id === sourceEntityTypeId)
    return type ? getIconComponent(type.icon) : Link2
  }

  return (
    <div className="border-t border-neutral-800 pt-4">
      <div className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-neutral-500 mb-2">
        <Link2 className="w-3.5 h-3.5" />
        Linked from ({backlinks.length})
      </div>
      <div className="space-y-1">
        {backlinks.map((link, i) => {
            const Icon = iconFor(link.sourceEntityTypeId)
            return (
                <button
                key={i}
                onClick={() => navigateToEntity(link.sourceEntityTypeId, link.sourceId)}
                className="w-full flex items-center gap-2 text-left text-sm text-neutral-300 hover:text-orange-400 hover:bg-neutral-800/50 rounded px-2 py-1.5"
                >
                <Icon className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                <span className="truncate">{link.sourceName || 'Untitled'}</span>
                {link.panelTitles.length > 0 && (
                    <span className="text-xs text-neutral-600 shrink-0 truncate">
                    via {link.panelTitles.map((t) => `"${t}"`).join(', ')}
                    </span>
                )}
                </button>
            )
            })}
      </div>
    </div>
  )
}