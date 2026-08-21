// src/components/modules/characters/CharacterEditor.tsx
import { useState, useRef, useEffect } from 'react'
import { Save, Trash2 } from 'lucide-react'
import type { Character, CharacterData } from '../../../types/character'

interface CharacterEditorProps {
  character: Character
  onSave: (fileName: string, data: CharacterData, content: string) => Promise<void>
  onDelete: () => void
}

export function CharacterEditor({ character, onSave, onDelete }: CharacterEditorProps) {
  const [name, setName] = useState(character.data.name ?? '')
  const [age, setAge] = useState(character.data.age?.toString() ?? '')
  const [role, setRole] = useState(character.data.role ?? '')
  const [tagsInput, setTagsInput] = useState((character.data.tags ?? []).join(', '))
  const [content, setContent] = useState(character.content)
  const [saving, setSaving] = useState(false)

  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-grow: starts compact, expands as content grows, caps at MAX_HEIGHT then scrolls
  const MIN_HEIGHT = 120  // px, roughly 5-6 lines
  const MAX_HEIGHT = 480  // px, roughly half a screen — beyond this it scrolls internally

  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto' // reset so scrollHeight recalculates correctly
    const nextHeight = Math.min(Math.max(el.scrollHeight, MIN_HEIGHT), MAX_HEIGHT)
    el.style.height = `${nextHeight}px`
  }, [content])

  const handleSave = async () => {
    setSaving(true)
    const data: CharacterData = {
      id: character.data.id,
      name: name.trim() || 'Untitled',
      age: age ? Number(age) : undefined,
      role: role.trim() || undefined,
      tags: tagsInput.split(',').map((t) => t.trim()).filter(Boolean),
    }
    await onSave(character.fileName, data, content)
    setSaving(false)
  }

  return (
    <div className="max-w-2xl space-y-6 pb-10">
      <div className="flex items-start justify-between gap-4">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Character name"
          className="text-2xl font-semibold bg-transparent border-b border-transparent focus:border-neutral-700 outline-none w-full text-neutral-100"
        />
        <button onClick={onDelete} className="text-neutral-600 hover:text-red-500 shrink-0 p-2" title="Delete character">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs uppercase tracking-wide text-neutral-500">Age</label>
          <input
            value={age}
            onChange={(e) => setAge(e.target.value)}
            type="number"
            className="mt-1 w-full bg-neutral-900 border border-neutral-800 rounded-md px-3 py-2 text-sm text-neutral-200 outline-none focus:border-orange-600"
          />
        </div>
        <div>
          <label className="text-xs uppercase tracking-wide text-neutral-500">Role</label>
          <input
            value={role}
            onChange={(e) => setRole(e.target.value)}
            placeholder="Protagonist, Antagonist..."
            className="mt-1 w-full bg-neutral-900 border border-neutral-800 rounded-md px-3 py-2 text-sm text-neutral-200 outline-none focus:border-orange-600"
          />
        </div>
      </div>

      <div>
        <label className="text-xs uppercase tracking-wide text-neutral-500">Tags</label>
        <input
          value={tagsInput}
          onChange={(e) => setTagsInput(e.target.value)}
          placeholder="human, warrior, exiled"
          className="mt-1 w-full bg-neutral-900 border border-neutral-800 rounded-md px-3 py-2 text-sm text-neutral-200 outline-none focus:border-orange-600"
        />
        <p className="text-xs text-neutral-600 mt-1">Comma-separated. Stored as a YAML list.</p>
      </div>

      <div>
        <label className="text-xs uppercase tracking-wide text-neutral-500">Biography / Notes</label>
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write freely — this becomes the Markdown body beneath the YAML frontmatter."
          className="mt-1 w-full bg-neutral-900 border border-neutral-800 rounded-md px-3 py-2 text-sm text-neutral-200 outline-none focus:border-orange-600 font-mono resize-none overflow-y-auto transition-[height] duration-100"
          style={{ height: `${MIN_HEIGHT}px` }}
        />
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white rounded-md px-4 py-2 text-sm"
      >
        <Save className="w-4 h-4" />
        {saving ? 'Saving...' : 'Save Character'}
      </button>
    </div>
  )
}