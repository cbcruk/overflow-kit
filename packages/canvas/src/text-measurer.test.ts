import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import {
  TextMeasurer,
  getSharedMeasurer,
  measureTextWidth,
} from './text-measurer'

describe('TextMeasurer', () => {
  let measurer: TextMeasurer

  beforeEach(() => {
    measurer = new TextMeasurer({ font: '16px Arial' })
  })

  afterEach(() => {
    measurer.destroy()
  })

  describe('measureText', () => {
    it('measures text width using canvas', () => {
      const width = measurer.measureText('Hello')

      expect(width).toBeGreaterThan(0)
      expect(typeof width).toBe('number')
    })

    it('returns different widths for different texts', () => {
      const shortWidth = measurer.measureText('Hi')
      const longWidth = measurer.measureText('Hello World')

      expect(longWidth).toBeGreaterThan(shortWidth)
    })

    it('caches measurements by default', () => {
      measurer.measureText('Test')
      measurer.measureText('Test')

      expect(measurer.getCacheSize()).toBe(1)
    })

    it('does not cache when disabled', () => {
      const noCacheMeasurer = new TextMeasurer({
        font: '16px Arial',
        cacheEnabled: false,
      })

      noCacheMeasurer.measureText('Test')
      noCacheMeasurer.measureText('Test')

      expect(noCacheMeasurer.getCacheSize()).toBe(0)
      noCacheMeasurer.destroy()
    })
  })

  describe('measureItem', () => {
    it('returns measured item with widths', () => {
      const item = { key: 1, text: 'Hello' }
      const measured = measurer.measureItem(item)

      expect(measured.key).toBe(1)
      expect(measured.text).toBe('Hello')
      expect(measured.textWidth).toBeGreaterThan(0)
      expect(measured.totalWidth).toBeGreaterThan(measured.textWidth)
    })
  })

  describe('measureItems', () => {
    it('measures multiple items', () => {
      const items = [
        { key: 1, text: 'A' },
        { key: 2, text: 'BB' },
        { key: 3, text: 'CCC' },
      ]
      const measured = measurer.measureItems(items)

      expect(measured).toHaveLength(3)
      expect(measured[0].totalWidth).toBeLessThan(measured[1].totalWidth)
      expect(measured[1].totalWidth).toBeLessThan(measured[2].totalWidth)
    })
  })

  describe('setFont', () => {
    it('updates font and clears cache', () => {
      measurer.measureText('Test')
      expect(measurer.getCacheSize()).toBe(1)

      measurer.setFont('20px Arial')

      expect(measurer.getCacheSize()).toBe(0)
    })

    it('changes measurement results', () => {
      const width16 = measurer.measureText('Hello')

      measurer.setFont('32px Arial')
      const width32 = measurer.measureText('Hello')

      expect(width32).toBeGreaterThan(width16)
    })
  })

  describe('setFontFromElement', () => {
    it('extracts font from DOM element', () => {
      const element = document.createElement('div')
      element.style.fontSize = '24px'
      element.style.fontFamily = 'sans-serif'
      document.body.appendChild(element)

      const width16 = measurer.measureText('Test')
      measurer.setFontFromElement(element)
      const width24 = measurer.measureText('Test')

      expect(width24).toBeGreaterThan(width16)

      document.body.removeChild(element)
    })
  })

  describe('setItemStyle', () => {
    it('updates item style for measurements', () => {
      const item = { key: 1, text: 'Test' }

      const measured1 = measurer.measureItem(item)
      measurer.setItemStyle({ paddingLeft: 50, paddingRight: 50 })
      const measured2 = measurer.measureItem(item)

      expect(measured2.totalWidth).toBeGreaterThan(measured1.totalWidth)
    })
  })

  describe('clearCache', () => {
    it('clears all cached measurements', () => {
      measurer.measureText('A')
      measurer.measureText('B')
      measurer.measureText('C')
      expect(measurer.getCacheSize()).toBe(3)

      measurer.clearCache()

      expect(measurer.getCacheSize()).toBe(0)
    })
  })

  describe('getItemStyle', () => {
    it('returns a copy of current item style', () => {
      const style = measurer.getItemStyle()

      expect(style.paddingLeft).toBeDefined()
      expect(style.paddingRight).toBeDefined()
    })
  })
})

describe('getSharedMeasurer', () => {
  it('returns same instance on multiple calls', () => {
    const measurer1 = getSharedMeasurer()
    const measurer2 = getSharedMeasurer()

    expect(measurer1).toBe(measurer2)
  })
})

describe('measureTextWidth', () => {
  it('measures text using shared measurer', () => {
    const width = measureTextWidth('Hello')

    expect(width).toBeGreaterThan(0)
  })

  it('returns consistent results for same text', () => {
    const width1 = measureTextWidth('Hello')
    const width2 = measureTextWidth('Hello')

    expect(width1).toBe(width2)
  })
})
