import { describe, it, expect } from 'vitest'
import type { MeasuredItem } from './types'
import {
  OverflowCalculator,
  calculateOverflow,
  getRestIndicatorText,
} from './calculator'

const createMeasuredItem = (
  key: string | number,
  text: string,
  totalWidth: number
): MeasuredItem => ({
  key,
  text,
  textWidth: totalWidth,
  totalWidth,
})

describe('OverflowCalculator', () => {
  describe('calculate', () => {
    it('returns empty result when no items', () => {
      const calculator = new OverflowCalculator()
      calculator.setItems([])

      const result = calculator.calculate(300)

      expect(result).toEqual({
        visibleCount: 0,
        hiddenCount: 0,
        visibleItems: [],
        hiddenItems: [],
        totalItemsWidth: 0,
      })
    })

    it('shows all items when they fit', () => {
      const calculator = new OverflowCalculator({ gap: 10 })
      const items = [
        createMeasuredItem(1, 'A', 50),
        createMeasuredItem(2, 'B', 50),
        createMeasuredItem(3, 'C', 50),
      ]
      calculator.setItems(items)

      // Total width: 50 + 10 + 50 + 10 + 50 = 170
      const result = calculator.calculate(200)

      expect(result.visibleCount).toBe(3)
      expect(result.hiddenCount).toBe(0)
      expect(result.visibleItems).toHaveLength(3)
      expect(result.hiddenItems).toHaveLength(0)
      expect(result.totalItemsWidth).toBe(170)
    })

    it('hides items that overflow', () => {
      const calculator = new OverflowCalculator({
        gap: 10,
        restIndicatorWidth: 40,
      })
      const items = [
        createMeasuredItem(1, 'A', 50),
        createMeasuredItem(2, 'B', 50),
        createMeasuredItem(3, 'C', 50),
        createMeasuredItem(4, 'D', 50),
      ]
      calculator.setItems(items)

      // Container: 150
      // Available for items: 150 - 40 (rest indicator) - 10 (gap) = 100
      // Items: 50 + 10 + 50 = 110 > 100, so only first item fits
      const result = calculator.calculate(150)

      expect(result.visibleCount).toBe(1)
      expect(result.hiddenCount).toBe(3)
      expect(result.visibleItems.map((i) => i.key)).toEqual([1])
      expect(result.hiddenItems.map((i) => i.key)).toEqual([2, 3, 4])
    })

    it('respects containerPadding', () => {
      const calculator = new OverflowCalculator({
        gap: 0,
        containerPadding: 20,
        restIndicatorWidth: 30,
      })
      const items = [
        createMeasuredItem(1, 'A', 50),
        createMeasuredItem(2, 'B', 50),
      ]
      calculator.setItems(items)

      // Container: 150
      // Available width: 150 - 20 * 2 (padding) = 110
      // Total items: 50 + 50 = 100 <= 110, all fit
      const result = calculator.calculate(150)

      expect(result.visibleCount).toBe(2)
      expect(result.hiddenCount).toBe(0)
    })

    it('hides all when container is too small', () => {
      const calculator = new OverflowCalculator({
        gap: 10,
        restIndicatorWidth: 40,
      })
      const items = [
        createMeasuredItem(1, 'A', 100),
        createMeasuredItem(2, 'B', 100),
      ]
      calculator.setItems(items)

      // Container: 50
      // Available: 50 - 40 - 10 = 0
      // First item (100) doesn't fit
      const result = calculator.calculate(50)

      expect(result.visibleCount).toBe(0)
      expect(result.hiddenCount).toBe(2)
    })

    it('can be called multiple times with different widths', () => {
      const calculator = new OverflowCalculator({ gap: 10 })
      const items = [
        createMeasuredItem(1, 'A', 50),
        createMeasuredItem(2, 'B', 50),
        createMeasuredItem(3, 'C', 50),
      ]
      calculator.setItems(items)

      const result1 = calculator.calculate(500)
      expect(result1.visibleCount).toBe(3)

      const result2 = calculator.calculate(100)
      expect(result2.visibleCount).toBeLessThan(3)
    })
  })

  describe('getRestIndicatorText', () => {
    it('uses default text function', () => {
      const calculator = new OverflowCalculator()

      expect(calculator.getRestIndicatorText(3)).toBe('+3')
    })

    it('uses custom text function', () => {
      const calculator = new OverflowCalculator({
        restIndicatorText: (count) => `${count} more`,
      })

      expect(calculator.getRestIndicatorText(3)).toBe('3 more')
    })
  })
})

describe('calculateOverflow', () => {
  it('works as a convenience function', () => {
    const items = [
      createMeasuredItem(1, 'A', 50),
      createMeasuredItem(2, 'B', 50),
    ]

    const result = calculateOverflow({
      items,
      containerWidth: 200,
      options: { gap: 10 },
    })

    expect(result.visibleCount).toBe(2)
    expect(result.hiddenCount).toBe(0)
    expect(result.totalItemsWidth).toBe(110)
  })
})

describe('getRestIndicatorText', () => {
  it('uses default text when no custom function', () => {
    expect(getRestIndicatorText(5)).toBe('+5')
  })

  it('uses custom function when provided', () => {
    const customText = (count: number) => `and ${count} more`

    expect(getRestIndicatorText(5, customText)).toBe('and 5 more')
  })
})
