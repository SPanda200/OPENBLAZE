// src/components/manuscript/MarkdownRenderer.tsx
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { LINK_TOKEN_REGEX } from '../shared/LinkedText'
import { useNavigation } from '../../context/NavigationContext'
import { useEntityRegistry } from '../../context/EntityRegistryContext'

function preprocessLinks(text: string): string {
  return text.replace(LINK_TOKEN_REGEX, (_m, entityTypeId, id, name) => `[${name}](openblaze://${entityTypeId}/${id})`)
}

function LinkRenderer({ href, children }: { href?: string; children?: React.ReactNode }) {
  const { navigateToEntity } = useNavigation()
  const { entities } = useEntityRegistry()

  if (href?.startsWith('openblaze://')) {
    const match = href.match(/^openblaze:\/\/([^/]+)\/(.+)$/)
    if (match) {
      const [, entityTypeId, id] = match
      const live = entities.find((e) => e.id === id && e.entityTypeId === entityTypeId)
      if (!live) {
        return <span className="text-neutral-600 line-through" title="This linked entry no longer exists">{children}</span>
      }
      return (
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); navigateToEntity(entityTypeId, id) }}
          className="inline text-orange-400 hover:text-orange-300 underline underline-offset-2 decoration-orange-400/40 cursor-pointer"
        >
          {children}
        </button>
      )
    }
  }

  // Regular external links: don't let Electron navigate the whole app window away.
  // (Opening these in the system browser is a good future addition via shell.openExternal.)
  return (
    <span onClick={(e) => e.preventDefault()} title={`${href} (external links aren't opened yet)`} className="text-neutral-400 underline decoration-dotted cursor-default">
      {children}
    </span>
  )
}

export function MarkdownRenderer({ text }: { text: string }) {
  const processed = preprocessLinks(text)
  return (
    <div className="text-sm text-neutral-300 leading-relaxed space-y-3">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: LinkRenderer,
          h1: (props) => <h1 className="text-2xl font-semibold text-neutral-100 mt-4 mb-2" {...props} />,
          h2: (props) => <h2 className="text-xl font-semibold text-neutral-100 mt-4 mb-2" {...props} />,
          h3: (props) => <h3 className="text-lg font-semibold text-neutral-100 mt-3 mb-1.5" {...props} />,
          p: (props) => <p className="text-neutral-300 leading-relaxed" {...props} />,
          ul: (props) => <ul className="list-disc list-inside space-y-1 text-neutral-300" {...props} />,
          ol: (props) => <ol className="list-decimal list-inside space-y-1 text-neutral-300" {...props} />,
          strong: (props) => <strong className="text-neutral-100 font-semibold" {...props} />,
          em: (props) => <em className="text-neutral-300 italic" {...props} />,
          blockquote: (props) => <blockquote className="border-l-2 border-neutral-700 pl-3 italic text-neutral-400" {...props} />,
          code: (props) => <code className="bg-neutral-800 px-1 py-0.5 rounded text-xs text-orange-300" {...props} />,
          hr: () => <hr className="border-neutral-800 my-4" />,
        }}
      >
        {processed}
      </ReactMarkdown>
    </div>
  )
}