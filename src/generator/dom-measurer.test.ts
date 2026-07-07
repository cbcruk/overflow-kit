// @vitest-environment happy-dom
import { describe, it, expect, beforeAll } from 'vitest'
import { DomMeasurer, measureElement, measureElements } from './dom-measurer'
import type { OverflowItem } from '../core'

beforeAll(() => {
  // happy-dom does not lay out elements; report 10px per character.
  window.Element.prototype.getBoundingClientRect = function () {
    const width = (this.textContent ?? '').length * 10
    return {
      width,
      height: 20,
      x: 0,
      y: 0,
      top: 0,
      left: 0,
      right: width,
      bottom: 20,
      toJSON: () => ({}),
    } as DOMRect
  }
})

function makeElement(text: string): HTMLElement {
  const el = document.createElement('span')
  el.textContent = text
  return el
}

const ITEMS: OverflowItem[] = [
  { key: 'a', text: 'Alpha' }, // 50px
  { key: 'b', text: 'Be' }, // 20px
]

function elementMap(): Map<string | number, HTMLElement> {
  return new Map([
    ['a', makeElement('Alpha')],
    ['b', makeElement('Be')],
  ])
}

describe('DomMeasurer', () => {
  it('measures an item from its element', () => {
    const elements = elementMap()
    const measurer = new DomMeasurer({
      getElement: (key) => elements.get(key) ?? null,
    })

    expect(measurer.measureItem(ITEMS[0])).toEqual({
      key: 'a',
      text: 'Alpha',
      textWidth: 50,
      totalWidth: 50,
    })
  })

  it('returns null when the element is missing', () => {
    const measurer = new DomMeasurer({ getElement: () => null })
    expect(measurer.measureItem(ITEMS[0])).toBeNull()
  })

  it('measureItems skips items whose elements are missing', () => {
    const elements = new Map([['a', makeElement('Alpha')]])
    const measurer = new DomMeasurer({
      getElement: (key) => elements.get(key) ?? null,
    })

    const result = measurer.measureItems(ITEMS)

    expect(result).toHaveLength(1)
    expect(result[0].key).toBe('a')
  })

  it('measureAll returns a Map keyed by item key', () => {
    const elements = elementMap()
    const measurer = new DomMeasurer({
      getElement: (key) => elements.get(key) ?? null,
    })

    const result = measurer.measureAll(ITEMS)

    expect(result.size).toBe(2)
    expect(result.get('a')?.totalWidth).toBe(50)
    expect(result.get('b')?.totalWidth).toBe(20)
  })
})

describe('measureElement / measureElements', () => {
  it('measureElement returns width and height', () => {
    expect(measureElement(makeElement('Alpha'))).toEqual({
      width: 50,
      height: 20,
    })
  })

  it('measureElements maps each key to its dimensions', () => {
    const result = measureElements(elementMap())

    expect(result.get('a')).toEqual({ width: 50, height: 20 })
    expect(result.get('b')).toEqual({ width: 20, height: 20 })
  })
})
