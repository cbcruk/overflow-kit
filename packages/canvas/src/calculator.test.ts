import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { CanvasCalculator, calculateWithCanvas } from './calculator'

describe('CanvasCalculator', () => {
  let calculator: CanvasCalculator

  beforeEach(() => {
    calculator = new CanvasCalculator({
      font: '16px Arial',
      gap: 8,
    })
  })

  afterEach(() => {
    calculator.destroy()
  })

  describe('setItems', () => {
    it('measures and stores items', () => {
      const items = [
        { key: 1, text: 'Hello' },
        { key: 2, text: 'World' },
      ]

      calculator.setItems(items)

      expect(calculator.getAllMeasuredItems()).toHaveLength(2)
    })
  })

  describe('addItem', () => {
    it('adds a single item', () => {
      calculator.setItems([{ key: 1, text: 'First' }])

      const measured = calculator.addItem({ key: 2, text: 'Second' })

      expect(measured.key).toBe(2)
      expect(calculator.getAllMeasuredItems()).toHaveLength(2)
    })
  })

  describe('removeItem', () => {
    it('removes item by key', () => {
      calculator.setItems([
        { key: 1, text: 'A' },
        { key: 2, text: 'B' },
      ])

      calculator.removeItem(1)

      expect(calculator.getAllMeasuredItems()).toHaveLength(1)
      expect(calculator.getMeasuredItem(1)).toBeUndefined()
    })
  })

  describe('calculate', () => {
    it('returns overflow result', () => {
      calculator.setItems([
        { key: 1, text: 'Item 1' },
        { key: 2, text: 'Item 2' },
        { key: 3, text: 'Item 3' },
      ])

      const result = calculator.calculate(500)

      expect(result.visibleCount).toBeGreaterThan(0)
      expect(result.visibleItems.length).toBe(result.visibleCount)
      expect(result.hiddenItems.length).toBe(result.hiddenCount)
      expect(result.totalItemsWidth).toBeGreaterThan(0)
    })

    it('hides items when container is small', () => {
      calculator.setItems([
        { key: 1, text: 'Very Long Item Text' },
        { key: 2, text: 'Another Long Item' },
        { key: 3, text: 'Third Long Item' },
      ])

      const result = calculator.calculate(100)

      expect(result.hiddenCount).toBeGreaterThan(0)
    })

    it('shows all items when container is large', () => {
      calculator.setItems([
        { key: 1, text: 'A' },
        { key: 2, text: 'B' },
      ])

      const result = calculator.calculate(1000)

      expect(result.visibleCount).toBe(2)
      expect(result.hiddenCount).toBe(0)
    })
  })

  describe('getMeasuredItem', () => {
    it('returns measured item by key', () => {
      calculator.setItems([{ key: 'test', text: 'Test Item' }])

      const item = calculator.getMeasuredItem('test')

      expect(item).toBeDefined()
      expect(item?.key).toBe('test')
      expect(item?.totalWidth).toBeGreaterThan(0)
    })

    it('returns undefined for non-existent key', () => {
      calculator.setItems([])

      expect(calculator.getMeasuredItem('missing')).toBeUndefined()
    })
  })

  describe('getRestIndicatorText', () => {
    it('returns default text', () => {
      expect(calculator.getRestIndicatorText(3)).toBe('+3')
    })

    it('uses custom function when provided', () => {
      const customCalculator = new CanvasCalculator({
        font: '16px Arial',
        restIndicatorText: (n) => `${n} more`,
      })

      expect(customCalculator.getRestIndicatorText(3)).toBe('3 more')
      customCalculator.destroy()
    })
  })

  describe('updateOptions', () => {
    it('updates font and re-measures items', () => {
      calculator.setItems([{ key: 1, text: 'Test' }])
      const width16 = calculator.getMeasuredItem(1)?.totalWidth ?? 0

      calculator.updateOptions({ font: '32px Arial' })
      const width32 = calculator.getMeasuredItem(1)?.totalWidth ?? 0

      expect(width32).toBeGreaterThan(width16)
    })

    it('updates gap option', () => {
      calculator.setItems([
        { key: 1, text: 'A' },
        { key: 2, text: 'B' },
      ])

      calculator.updateOptions({ gap: 100 })
      const result = calculator.calculate(200)

      expect(result.totalItemsWidth).toBeGreaterThan(100)
    })
  })
})

describe('calculateWithCanvas', () => {
  it('calculates overflow in one call', () => {
    const items = [
      { key: 1, text: 'Hello' },
      { key: 2, text: 'World' },
    ]

    const result = calculateWithCanvas(items, 500, { font: '16px Arial' })

    expect(result.visibleCount).toBeGreaterThan(0)
    expect(result.totalItemsWidth).toBeGreaterThan(0)
  })

  it('works with minimal options', () => {
    const items = [{ key: 1, text: 'Test' }]

    const result = calculateWithCanvas(items, 500)

    expect(result.visibleCount).toBe(1)
  })
})
