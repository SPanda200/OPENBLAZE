// src/utils/buildEntityTree.ts
import type { Entity } from '../types/entity'

export interface EntityTreeNode {
  entity: Entity
  children: EntityTreeNode[]
}

export function buildEntityTree(entities: Entity[]): EntityTreeNode[] {
  const nodeMap = new Map<string, EntityTreeNode>()
  entities.forEach((e) => nodeMap.set(e.data.id, { entity: e, children: [] }))

  const roots: EntityTreeNode[] = []
  nodeMap.forEach((node) => {
    const parentId = node.entity.data.parentId
    if (parentId && nodeMap.has(parentId)) nodeMap.get(parentId)!.children.push(node)
    else roots.push(node)
  })
  return roots
}

export function getDescendantIds(entityId: string, entities: Entity[]): Set<string> {
  const childrenOf = new Map<string, string[]>()
  entities.forEach((e) => {
    const pid = e.data.parentId
    if (pid) {
      if (!childrenOf.has(pid)) childrenOf.set(pid, [])
      childrenOf.get(pid)!.push(e.data.id)
    }
  })
  const result = new Set<string>()
  const stack = [...(childrenOf.get(entityId) ?? [])]
  while (stack.length) {
    const current = stack.pop()!
    if (result.has(current)) continue
    result.add(current)
    stack.push(...(childrenOf.get(current) ?? []))
  }
  return result
}