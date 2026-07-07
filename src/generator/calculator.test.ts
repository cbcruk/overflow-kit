// @vitest-environment happy-dom
import { describe, it, expect, beforeAll } from 'vitest'
import { GeneratorCalculator, calculateWithGenerator } from './calculator'
import type { OverflowItem } from '../core'

beforeAll(() => {
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

const ITEMS: OverflowItem[] = [
  { key: 1, text: 'AAAAA' }, // 50px
  { key: 2, text: 'BBBBB' }, // 50px
  { key: 3, text: 'CCCCC' }, // 50px
]

describe('GeneratorCalculator (auto mode)', () => {
  it('walks through every phase in order', () => {
    const calculator = new GeneratorCalculator({ gap: 0 })
    calculator.setItems(ITEMS)

    expect(calculator.getState().phase).toBe('idle')

    calculator.calculate(1000)
    expect(calculator.getState().phase).toBe('rendering')

    expect(calculator.nextStep()).toBe(true)
    expect(calculator.getState().phase).toBe('measuring')

    expect(calculator.nextStep()).toBe(true)
    expect(calculator.getState().phase).toBe('calculating')

    expect(calculator.nextStep()).toBe(true)
    expect(calculator.getState().phase).toBe('complete')

    expect(calculator.nextStep()).toBe(false)
  })

  it('runToCompletion shows all items when they fit', () => {
    const calculator = new GeneratorCalculator({ gap: 0 })
    calculator.setItems(ITEMS)

    const result = calculator.runToCompletion(1000)

    expect(result.visibleCount).toBe(3)
    expect(result.hiddenCount).toBe(0)
    expect(result.totalItemsWidth).toBe(150)
  })

  it('runToCompletion partitions items on overflow', () => {
    // widths 50 each, gap 0, restIndicatorWidth 40
    // available 95 -> maxWidthForItems = 95 - 40 - 0 = 55
    // item 0 (50) fits; item 1 (50) -> 100 > 55 -> hidden
    const calculator = new GeneratorCalculator({
      gap: 0,
      restIndicatorWidth: 40,
    })
    calculator.setItems(ITEMS)

    const result = calculator.runToCompletion(95)

    expect(result.visibleCount).toBe(1)
    expect(result.hiddenCount).toBe(2)
  })

  it('exposes measurements after completion', () => {
    const calculator = new GeneratorCalculator({ gap: 0 })
    calculator.setItems(ITEMS)
    calculator.runToCompletion(1000)

    expect(calculator.getMeasurement(1)?.totalWidth).toBe(50)
    expect(calculator.getAllMeasurements()).toHaveLength(3)
  })

  it('reset() returns to idle and clears measurements', () => {
    const calculator = new GeneratorCalculator({ gap: 0 })
    calculator.setItems(ITEMS)
    calculator.runToCompletion(1000)

    calculator.reset()

    expect(calculator.getState().phase).toBe('idle')
    expect(calculator.getAllMeasurements()).toHaveLength(0)
  })

  it('getRestIndicatorText honors a custom formatter', () => {
    const calculator = new GeneratorCalculator({
      restIndicatorText: (count) => `${count} hidden`,
    })
    expect(calculator.getRestIndicatorText(2)).toBe('2 hidden')
  })
})

describe('GeneratorCalculator (manual mode)', () => {
  it('measures items via getElement', () => {
    const elements = new Map<string | number, HTMLElement>()
    for (const item of ITEMS) {
      const el = document.createElement('span')
      el.textContent = item.text
      elements.set(item.key, el)
    }

    const calculator = new GeneratorCalculator({
      gap: 0,
      getElement: (key) => elements.get(key) ?? null,
    })
    calculator.setItems(ITEMS)

    const result = calculator.runToCompletion(1000)

    expect(result.visibleCount).toBe(3)
    expect(result.totalItemsWidth).toBe(150)
  })
})

describe('calculateWithGenerator', () => {
  it('runs the calculation synchronously in one call', () => {
    const elements = new Map<string | number, HTMLElement>()
    for (const item of ITEMS) {
      const el = document.createElement('span')
      el.textContent = item.text
      elements.set(item.key, el)
    }

    const result = calculateWithGenerator(ITEMS, 1000, {
      gap: 0,
      getElement: (key) => elements.get(key) ?? null,
    })

    expect(result.visibleCount).toBe(3)
  })
})
