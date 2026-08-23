// src/types/location.ts
export interface LocationData {
  id: string
  name: string
  type?: string        // "Continent", "Kingdom", "City", "Building", etc.
  climate?: string
  tags?: string[]
  parentId?: string | null   // references another Location's id — null/undefined = top-level
}

export interface Location {
  data: LocationData
  content: string
  fileName: string
}