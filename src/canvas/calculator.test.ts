// @vitest-environment happy-dom
import { describe, it, expect, beforeEach } from 'vitest'
import { CanvasCalculator, calculateWithCanvas } from './calculator'
import type { ItemStyle, OverflowItem } from '../core'

type FakeCtx = { font: string; measureText: (t: string) => { width: number } }

beforeEach(() => {
  const ctx: FakeCtx = {
    font: '',
    measureText: (t) => ({ width: t.length * 10 }),
  }
  window.HTMLCanvasElement.prototype.getContext = (() =>
    ctx) as unknown as typeof HTMLCanvasElement.prototype.getContext
})

// Zero out the style so totalWidth equals the measured text width.
const NO_STYLE: ItemStyle = {
  paddingLeft: 0,
  paddingRight: 0,
  marginLeft: 0,
  marginRight: 0,
  borderWidth: 0,
}

const ITEMS: OverflowItem[] = [
  { key: 1, text: 'AB' }, // 20px
  { key: 2, text: 'CD' }, // 20px
  { key: 3, text: 'EF' }, // 20px
]

function makeCalculator(overrides = {}) {
  return new CanvasCalculator({
    font: '14px Arial',
    itemStyle: NO_STYLE,
    gap: 0,
    ...overrides,
  })
}

describe('CanvasCalculator', () => {
  it('shows all items when they fit', () => {
    const calculator = makeCalculator()
    calculator.setItems(ITEMS)

    const result = calculator.calculate(1000)

    expect(result.visibleCount).toBe(3)
    expect(result.totalItemsWidth).toBe(60)
  })

  it('partitions items on overflow', () => {
    // total 60 > available 45; maxWidthForItems = 45 - 20 - 0 = 25
    // item 0 (20) fits; item 1 (20) -> 40 > 25 -> hidden
    const calculator = makeCalculator({ restIndicatorWidth: 20 })
    calculator.setItems(ITEMS)

    const result = calculator.calculate(45)

    expect(result.visibleCount).toBe(1)
    expect(result.hiddenCount).toBe(2)
  })

  it('addItem and removeItem update the item set', () => {
    const calculator = makeCalculator()
    calculator.setItems(ITEMS)

    calculator.addItem({ key: 4, text: 'GH' })
    expect(calculator.calculate(1000).visibleCount).toBe(4)

    calculator.removeItem(4)
    expect(calculator.calculate(1000).visibleCount).toBe(3)
  })

  it('exposes measured items by key', () => {
    const calculator = makeCalculator()
    calculator.setItems(ITEMS)

    expect(calculator.getMeasuredItem(1)?.totalWidth).toBe(20)
    expect(calculator.getMeasuredItem(99)).toBeUndefined()
    expect(calculator.getAllMeasuredItems()).toHaveLength(3)
  })

  it('updateOptions re-measures and recalculates', () => {
    const calculator = makeCalculator()
    calculator.setItems(ITEMS)
    expect(calculator.calculate(1000).totalItemsWidth).toBe(60)

    calculator.updateOptions({ gap: 10 })

    // total = 60 + gap 10 * 2 = 80
    expect(calculator.calculate(1000).totalItemsWidth).toBe(80)
  })

  it('getRestIndicatorText honors a custom formatter', () => {
    const calculator = makeCalculator({
      restIndicatorText: (count: number) => `${count} more`,
    })
    expect(calculator.getRestIndicatorText(3)).toBe('3 more')
  })
})

describe('calculateWithCanvas', () => {
  it('measures and calculates in a single call', () => {
    const result = calculateWithCanvas(ITEMS, 1000, {
      font: '14px Arial',
      itemStyle: NO_STYLE,
      gap: 0,
    })

    expect(result.visibleCount).toBe(3)
    expect(result.totalItemsWidth).toBe(60)
  })
})
