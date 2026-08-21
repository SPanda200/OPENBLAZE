// src/hooks/useCharacterData.ts
import { useCallback, useEffect, useState } from 'react'
import { useVault } from '../context/VaultContext'
import type { Character, CharacterData } from '../types/character'

const MODULE_FOLDER = 'Characters'

export function useCharacterData() {
  const { vaultPath } = useVault()
  const [characters, setCharacters] = useState<Character[]>([])
  const [loading, setLoading] = useState(false)

  const refresh = useCallback(async () => {
    if (!vaultPath) return
    setLoading(true)
    const fileNames = await window.electron.listEntries(vaultPath, MODULE_FOLDER)
    const loaded = await Promise.all(
      fileNames.map((fn) => window.electron.readEntry(vaultPath, MODULE_FOLDER, fn))
    )
    loaded.sort((a, b) => (a.data.name || '').localeCompare(b.data.name || ''))
    setCharacters(loaded as Character[])
    setLoading(false)
  }, [vaultPath])

  useEffect(() => {
    refresh()
  }, [refresh])

  const saveCharacter = useCallback(
    async (fileName: string, data: CharacterData, content: string) => {
      if (!vaultPath) return
      await window.electron.writeEntry(vaultPath, MODULE_FOLDER, fileName, data, content)
      await refresh()
    },
    [vaultPath, refresh]
  )

  const createCharacter = useCallback(async (): Promise<Character> => {
    const id = `char_${Date.now()}`
    const fileName = `${id}.md`
    const data: CharacterData = { id, name: 'New Character', tags: [] }
    await saveCharacter(fileName, data, '')
    return { data, content: '', fileName }
  }, [saveCharacter])

  const deleteCharacter = useCallback(
    async (fileName: string) => {
      if (!vaultPath) return
      await window.electron.deleteEntry(vaultPath, MODULE_FOLDER, fileName)
      await refresh()
    },
    [vaultPath, refresh]
  )

  return { characters, loading, refresh, saveCharacter, createCharacter, deleteCharacter }
}