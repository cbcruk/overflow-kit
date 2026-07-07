import { describe, it, expect } from 'vitest'
import {
  OverflowCalculator,
  calculateOverflow,
  getRestIndicatorText,
} from './calculator'
import type { MeasuredItem } from './types'

/**
 * Helper to build measured items with a given total width.
 * textWidth is irrelevant to overflow partitioning, so we mirror totalWidth.
 */
function items(...widths: number[]): MeasuredItem[] {
  return widths.map((totalWidth, i) => ({
    key: i + 1,
    text: `item-${i + 1}`,
    textWidth: totalWidth,
    totalWidth,
  }))
}

describe('OverflowCalculator.calculate', () => {
  it('returns an empty result for no items', () => {
    const calc = new OverflowCalculator()
    calc.setItems([])

    const result = calc.calculate(300)

    expect(result.visibleCount).toBe(0)
    expect(result.hiddenCount).toBe(0)
    expect(result.visibleItems).toEqual([])
    expect(result.hiddenItems).toEqual([])
    expect(result.totalItemsWidth).toBe(0)
  })

  it('shows all items when they fit within the container', () => {
    const calc = new OverflowCalculator({ gap: 8 })
    calc.setItems(items(50, 80, 60))

    // total = 50 + 80 + 60 + gap(8) * 2 = 206
    const result = calc.calculate(300)

    expect(result.totalItemsWidth).toBe(206)
    expect(result.visibleCount).toBe(3)
    expect(result.hiddenCount).toBe(0)
    expect(result.hiddenItems).toEqual([])
  })

  it('treats a container that exactly fits total width as no overflow', () => {
    const calc = new OverflowCalculator({ gap: 0 })
    calc.setItems(items(100, 100))

    // total = 200, availableWidth = 200 -> 200 <= 200 shows all
    const result = calc.calculate(200)

    expect(result.visibleCount).toBe(2)
    expect(result.hiddenCount).toBe(0)
  })

  it('partitions items when they overflow, reserving space for the indicator', () => {
    const calc = new OverflowCalculator({ gap: 8, restIndicatorWidth: 40 })
    calc.setItems(items(50, 80, 60))

    // total = 206 > available 150 -> partition
    // maxWidthForItems = 150 - 40 - 8 = 102
    // i0: 50 (<=102) visible, current=50
    // i1: 80 + gap 8 = 88 -> 50+88=138 > 102 -> hide [80, 60]
    const result = calc.calculate(150)

    expect(result.visibleCount).toBe(1)
    expect(result.hiddenCount).toBe(2)
    expect(result.visibleItems.map((i) => i.totalWidth)).toEqual([50])
    expect(result.hiddenItems.map((i) => i.totalWidth)).toEqual([80, 60])
    // totalItemsWidth still reflects the full set
    expect(result.totalItemsWidth).toBe(206)
  })

  it('hides every item when even the first one cannot fit', () => {
    const calc = new OverflowCalculator({ gap: 8, restIndicatorWidth: 40 })
    calc.setItems(items(200))

    // total 200 > available 100 -> partition
    // maxWidthForItems = 100 - 40 - 8 = 52; first item 200 > 52 -> hide all
    const result = calc.calculate(100)

    expect(result.visibleCount).toBe(0)
    expect(result.hiddenCount).toBe(1)
    expect(result.hiddenItems.map((i) => i.totalWidth)).toEqual([200])
  })

  it('accounts for container padding on both sides', () => {
    const calc = new OverflowCalculator({
      gap: 0,
      restIndicatorWidth: 40,
      containerPadding: 30,
    })
    calc.setItems(items(50, 50))

    // total = 100; availableWidth = container - padding*2
    // container 160 -> available 100 -> 100 <= 100 shows all
    expect(calc.calculate(160).visibleCount).toBe(2)

    // container 159 -> available 99 < 100 -> partition
    // maxWidthForItems = 99 - 40 - 0 = 59
    // i0: 50 <= 59 visible; i1: 50 -> 100 > 59 hide
    const tight = calc.calculate(159)
    expect(tight.visibleCount).toBe(1)
    expect(tight.hiddenCount).toBe(1)
  })

  it('includes gaps between items in the total width', () => {
    const calc = new OverflowCalculator({ gap: 5 })
    calc.setItems(items(10, 10, 10))

    // total = 30 + 5 * 2 = 40
    expect(calc.calculate(1000).totalItemsWidth).toBe(40)
  })

  it('does not add a gap for a single item', () => {
    const calc = new OverflowCalculator({ gap: 5 })
    calc.setItems(items(10))

    expect(calc.calculate(1000).totalItemsWidth).toBe(10)
  })

  it('uses default options when none are provided (gap 4, indicator 40)', () => {
    const calc = new OverflowCalculator()
    calc.setItems(items(10, 10, 10))

    // total = 30 + defaultGap(4) * 2 = 38
    expect(calc.calculate(1000).totalItemsWidth).toBe(38)
  })

  it('recomputes cleanly on repeated calls (state reset)', () => {
    const calc = new OverflowCalculator({ gap: 8, restIndicatorWidth: 40 })
    calc.setItems(items(50, 80, 60))

    const overflow = calc.calculate(150)
    expect(overflow.visibleCount).toBe(1)

    const fits = calc.calculate(1000)
    expect(fits.visibleCount).toBe(3)
    expect(fits.hiddenCount).toBe(0)
  })
})

describe('OverflowCalculator.getRestIndicatorText', () => {
  it('uses the default "+N" format', () => {
    const calc = new OverflowCalculator()
    expect(calc.getRestIndicatorText(3)).toBe('+3')
  })

  it('uses a custom formatter when provided', () => {
    const calc = new OverflowCalculator({
      restIndicatorText: (count) => `${count} more`,
    })
    expect(calc.getRestIndicatorText(3)).toBe('3 more')
  })
})

describe('calculateOverflow', () => {
  it('matches the class-based calculator result', () => {
    const measured = items(50, 80, 60)

    const viaFn = calculateOverflow({
      items: measured,
      containerWidth: 150,
      options: { gap: 8, restIndicatorWidth: 40 },
    })

    const calc = new OverflowCalculator({ gap: 8, restIndicatorWidth: 40 })
    calc.setItems(measured)
    const viaClass = calc.calculate(150)

    expect(viaFn).toEqual(viaClass)
  })
})

describe('getRestIndicatorText', () => {
  it('defaults to "+N"', () => {
    expect(getRestIndicatorText(5)).toBe('+5')
  })

  it('applies a custom formatter', () => {
    expect(getRestIndicatorText(5, (c) => `and ${c} others`)).toBe(
      'and 5 others'
    )
  })
})
