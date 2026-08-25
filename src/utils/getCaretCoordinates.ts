// src/utils/getCaretCoordinates.ts
const PROPERTIES = [
  'boxSizing', 'width', 'height', 'overflowX', 'overflowY',
  'borderTopWidth', 'borderRightWidth', 'borderBottomWidth', 'borderLeftWidth', 'borderStyle',
  'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft',
  'fontStyle', 'fontVariant', 'fontWeight', 'fontStretch', 'fontSize', 'fontSizeAdjust',
  'lineHeight', 'fontFamily', 'textAlign', 'textTransform', 'textIndent', 'textDecoration',
  'letterSpacing', 'wordSpacing', 'tabSize',
] as const

export interface CaretCoordinates {
  top: number
  left: number
  height: number
}

export function getCaretCoordinates(el: HTMLTextAreaElement, position: number): CaretCoordinates {
  const div = document.createElement('div')
  document.body.appendChild(div)
  const style = div.style
  const computed = window.getComputedStyle(el)

  style.whiteSpace = 'pre-wrap'
  style.wordWrap = 'break-word'
  style.position = 'absolute'
  style.visibility = 'hidden'
  style.left = '-9999px'
  style.top = '0px'
  style.width = computed.width

  PROPERTIES.forEach((prop) => {
    // @ts-expect-error dynamic CSSStyleDeclaration key
    style[prop] = computed[prop]
  })

  div.textContent = el.value.substring(0, position)
  const span = document.createElement('span')
  span.textContent = el.value.substring(position) || '.'
  div.appendChild(span)

  const top = span.offsetTop + parseInt(computed.borderTopWidth || '0', 10)
  const left = span.offsetLeft + parseInt(computed.borderLeftWidth || '0', 10)
  const height = parseInt(computed.lineHeight || '16', 10)

  document.body.removeChild(div)
  return { top, left, height }
}