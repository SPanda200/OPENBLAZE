// src/utils/buildLocationTree.ts
import type { Entity } from '../types/entity'

export interface LocationTreeNode {
  location: Entity
  children: LocationTreeNode[]
}

export function buildLocationTree(locations: Entity[]): LocationTreeNode[] {
  const nodeMap = new Map<string, LocationTreeNode>()
  locations.forEach((loc) => nodeMap.set(loc.data.id, { location: loc, children: [] }))

  const roots: LocationTreeNode[] = []
  nodeMap.forEach((node) => {
    const parentId = node.location.data.parentId
    if (parentId && nodeMap.has(parentId)) {
      nodeMap.get(parentId)!.children.push(node)
    } else {
      roots.push(node)
    }
  })
  return roots
}

export function getDescendantIds(locationId: string, locations: Entity[]): Set<string> {
  const childrenOf = new Map<string, string[]>()
  locations.forEach((loc) => {
    const pid = loc.data.parentId
    if (pid) {
      if (!childrenOf.has(pid)) childrenOf.set(pid, [])
      childrenOf.get(pid)!.push(loc.data.id)
    }
  })

  const result = new Set<string>()
  const stack = [...(childrenOf.get(locationId) ?? [])]
  while (stack.length) {
    const current = stack.pop()!
    if (result.has(current)) continue
    result.add(current)
    stack.push(...(childrenOf.get(current) ?? []))
  }
  return result
}