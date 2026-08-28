// src/utils/wordCount.ts
import { LINK_TOKEN_REGEX } from '../components/shared/LinkedText'

export function stripLinkTokens(text: string): string {
  return text.replace(new RegExp(LINK_TOKEN_REGEX), (_m, _type, _id, name) => name)
}

export function countWords(text: string): number {
  const stripped = stripLinkTokens(text).replace(/[#>*_`~-]/g, ' ')
  return stripped.trim().split(/\s+/).filter(Boolean).length
}