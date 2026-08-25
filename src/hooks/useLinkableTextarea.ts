// src/hooks/useLinkableTextarea.ts
import { useEffect, useRef, useState } from 'react'
import { useEntitySearch } from './useEntitySearch'
import { getCaretCoordinates } from '../utils/getCaretCoordinates'
import type { LinkableEntity } from '../types/entity'

interface AnchorRect { top: number; left: number }

interface UseLinkableTextareaOptions {
  value: string
  onChange: (value: string) => void
}

export function useLinkableTextarea({ value, onChange }: UseLinkableTextareaOptions) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [pickerQuery, setPickerQuery] = useState('')
  const [highlightedIndex, setHighlightedIndex] = useState(0)
  const [anchorRect, setAnchorRect] = useState<AnchorRect | null>(null)
  const { results } = useEntitySearch(pickerQuery)

  // Close instead of leaving a stale position if the page scrolls underneath the picker
  useEffect(() => {
    if (!pickerOpen) return
    const handleScroll = () => setPickerOpen(false)
    window.addEventListener('scroll', handleScroll, true)
    return () => window.removeEventListener('scroll', handleScroll, true)
  }, [pickerOpen])

  const updateAnchor = (cursor: number) => {
    const el = textareaRef.current
    if (!el) return
    const caret = getCaretCoordinates(el, cursor)
    const box = el.getBoundingClientRect()
    setAnchorRect({
      top: box.top + (caret.top - el.scrollTop) + caret.height + 4,
      left: box.left + caret.left,
    })
  }

  const handleChange = (newValue: string) => {
    onChange(newValue)
    const cursor = textareaRef.current?.selectionStart ?? newValue.length
    const uptoCursor = newValue.slice(0, cursor)
    const match = uptoCursor.match(/@([^\s@[\]]*)$/)
    if (match) {
      setPickerQuery(match[1])
      setPickerOpen(true)
      setHighlightedIndex(0)
      updateAnchor(cursor)
    } else {
      setPickerOpen(false)
    }
  }

  const insertLink = (entity: LinkableEntity) => {
    const el = textareaRef.current
    if (!el) return
    const cursor = el.selectionStart
    const uptoCursor = value.slice(0, cursor)
    const match = uptoCursor.match(/@([^\s@[\]]*)$/)
    if (!match) return
    const startOfAt = cursor - match[0].length
    const token = `[[${entity.entityTypeId}:${entity.id}:${entity.name}]]`
    const newValue = value.slice(0, startOfAt) + token + ' ' + value.slice(cursor)
    onChange(newValue)
    setPickerOpen(false)
    requestAnimationFrame(() => {
      el.focus()
      const newCursor = startOfAt + token.length + 1
      el.setSelectionRange(newCursor, newCursor)
    })
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!pickerOpen || results.length === 0) return
    if (e.key === 'ArrowDown') { e.preventDefault(); setHighlightedIndex((i) => (i + 1) % results.length) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setHighlightedIndex((i) => (i - 1 + results.length) % results.length) }
    else if (e.key === 'Enter') { e.preventDefault(); insertLink(results[highlightedIndex]) }
    else if (e.key === 'Escape') { e.preventDefault(); setPickerOpen(false) }
  }

  const closePicker = () => setPickerOpen(false)

  return { textareaRef, pickerOpen, pickerQuery, highlightedIndex, anchorRect, handleChange, handleKeyDown, insertLink, closePicker }
}