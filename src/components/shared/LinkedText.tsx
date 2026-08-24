// src/components/shared/LinkedText.tsx
import type { LinkableEntity } from '../../types/entity'

export const LINK_TOKEN_REGEX = /\[\[(\w[\w-]*):([\w-]+):([^\]]+)\]\]/g

interface LinkedTextProps {
  text: string
  entities: LinkableEntity[]
  onLinkClick: (entityTypeId: string, id: string) => void
}

export function LinkedText({ text, entities, onLinkClick }: LinkedTextProps) {
  const parts: React.ReactNode[] = []
  let lastIndex = 0
  let match: RegExpExecArray | null
  let key = 0
  const regex = new RegExp(LINK_TOKEN_REGEX)

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) parts.push(text.slice(lastIndex, match.index))
    const [, entityTypeId, id, fallbackDisplay] = match
    const live = entities.find((e) => e.id === id && e.entityTypeId === entityTypeId)
    const displayName = live?.name || fallbackDisplay
    const broken = !live

    parts.push(
      <button
        key={key++}
        onClick={(e) => { e.stopPropagation(); if (!broken) onLinkClick(entityTypeId, id) }}
        title={broken ? 'This linked entry no longer exists' : `Go to ${displayName}`}
        className={broken ? 'inline text-neutral-600 line-through cursor-default' : 'inline text-orange-400 hover:text-orange-300 underline underline-offset-2 decoration-orange-400/40 cursor-pointer'}
      >
        {displayName}
      </button>
    )
    lastIndex = regex.lastIndex
  }
  if (lastIndex < text.length) parts.push(text.slice(lastIndex))
  return <>{parts}</>
}