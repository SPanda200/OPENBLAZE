// src/config/iconOptions.ts
import {
  Users, Map, Sword, Crown, Ship, Landmark, Scroll, Sparkles, PawPrint,
  Building2, Gem, Shield, Flag, Skull, BookOpen, Compass,
} from 'lucide-react'

export const ICON_OPTIONS: Record<string, React.ElementType> = {
  users: Users, map: Map, sword: Sword, crown: Crown, ship: Ship,
  landmark: Landmark, scroll: Scroll, sparkles: Sparkles, pawPrint: PawPrint,
  building: Building2, gem: Gem, shield: Shield, flag: Flag, skull: Skull,
  book: BookOpen, compass: Compass,
}

export function getIconComponent(key: string): React.ElementType {
  return ICON_OPTIONS[key] ?? Users
}