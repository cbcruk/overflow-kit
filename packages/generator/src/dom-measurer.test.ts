import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { DomMeasurer, measureElement, measureElements } from './dom-measurer'

describe('DomMeasurer', () => {
  let container: HTMLDivElement
  let elements: Map<string | number, HTMLElement>

  beforeEach(() => {
    container = document.createElement('div')
    container.style.position = 'absolute'
    container.style.top = '0'
    container.style.left = '0'
    document.body.appendChild(container)
    elements = new Map()
  })

  afterEach(() => {
    document.body.removeChild(container)
    elements.clear()
  })

  const createTestElement = (
    key: string | number,
    width: number
  ): HTMLElement => {
    const el = document.createElement('span')
    el.id = `item-${key}`
    el.style.display = 'inline-block'
    el.style.width = `${width}px`
    el.style.height = '20px'
    el.textContent = `Item ${key}`
    container.appendChild(el)
    elements.set(key, el)
    return el
  }

  describe('measureItem', () => {
    it('measures item using DOM element', () => {
      createTestElement(1, 100)

      const measurer = new DomMeasurer({
        getElement: (key) => elements.get(key) ?? null,
      })

      const result = measurer.measureItem({ key: 1, text: 'Item 1' })

      expect(result).not.toBeNull()
      expect(result?.key).toBe(1)
      expect(result?.totalWidth).toBe(100)
    })

    it('returns null when element not found', () => {
      const measurer = new DomMeasurer({
        getElement: () => null,
      })

      const result = measurer.measureItem({ key: 'missing', text: 'Missing' })

      expect(result).toBeNull()
    })
  })

  describe('measureItems', () => {
    it('measures multiple items', () => {
      createTestElement(1, 50)
      createTestElement(2, 100)
      createTestElement(3, 150)

      const measurer = new DomMeasurer({
        getElement: (key) => elements.get(key) ?? null,
      })

      const items = [
        { key: 1, text: 'A' },
        { key: 2, text: 'B' },
        { key: 3, text: 'C' },
      ]

      const results = measurer.measureItems(items)

      expect(results).toHaveLength(3)
      expect(results[0].totalWidth).toBe(50)
      expect(results[1].totalWidth).toBe(100)
      expect(results[2].totalWidth).toBe(150)
    })

    it('skips items without elements', () => {
      createTestElement(1, 50)
      createTestElement(3, 150)

      const measurer = new DomMeasurer({
        getElement: (key) => elements.get(key) ?? null,
      })

      const items = [
        { key: 1, text: 'A' },
        { key: 2, text: 'B' },
        { key: 3, text: 'C' },
      ]

      const results = measurer.measureItems(items)

      expect(results).toHaveLength(2)
      expect(results.map((r) => r.key)).toEqual([1, 3])
    })
  })

  describe('measureAll', () => {
    it('returns Map of measurements', () => {
      createTestElement('a', 50)
      createTestElement('b', 100)

      const measurer = new DomMeasurer({
        getElement: (key) => elements.get(key) ?? null,
      })

      const items = [
        { key: 'a', text: 'A' },
        { key: 'b', text: 'B' },
      ]

      const results = measurer.measureAll(items)

      expect(results.size).toBe(2)
      expect(results.get('a')?.totalWidth).toBe(50)
      expect(results.get('b')?.totalWidth).toBe(100)
    })
  })
})

describe('measureElement', () => {
  it('returns width and height', () => {
    const el = document.createElement('div')
    el.style.width = '200px'
    el.style.height = '100px'
    document.body.appendChild(el)

    const result = measureElement(el)

    expect(result.width).toBe(200)
    expect(result.height).toBe(100)

    document.body.removeChild(el)
  })
})

describe('measureElements', () => {
  it('measures multiple elements', () => {
    const el1 = document.createElement('div')
    el1.style.width = '100px'
    el1.style.height = '50px'

    const el2 = document.createElement('div')
    el2.style.width = '200px'
    el2.style.height = '100px'

    document.body.appendChild(el1)
    document.body.appendChild(el2)

    const elements = new Map<string | number, HTMLElement>([
      ['first', el1],
      ['second', el2],
    ])

    const results = measureElements(elements)

    expect(results.size).toBe(2)
    expect(results.get('first')).toEqual({ width: 100, height: 50 })
    expect(results.get('second')).toEqual({ width: 200, height: 100 })

    document.body.removeChild(el1)
    document.body.removeChild(el2)
  })
})
