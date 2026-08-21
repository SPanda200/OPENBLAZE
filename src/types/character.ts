// src/types/character.ts
export interface CharacterData {
  id: string
  name: string
  age?: number
  role?: string
  tags?: string[]
}

export interface Character {
  data: CharacterData
  content: string
  fileName: string
}