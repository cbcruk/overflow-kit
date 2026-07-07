// @vitest-environment happy-dom
import { describe, it, expect, beforeEach } from 'vitest'
import {
  TextMeasurer,
  getSharedMeasurer,
  measureTextWidth,
} from './text-measurer'

type FakeCtx = { font: string; measureText: (t: string) => { width: number } }

function stubGetContext(ctx: FakeCtx | null): void {
  window.HTMLCanvasElement.prototype.getContext = (() =>
    ctx) as unknown as typeof HTMLCanvasElement.prototype.getContext
}

// A context that reports 10px per character.
function widthByLength(): FakeCtx {
  return { font: '', measureText: (t) => ({ width: t.length * 10 }) }
}

beforeEach(() => {
  stubGetContext(widthByLength())
})

describe('TextMeasurer.measureText', () => {
  it('measures via the canvas context', () => {
    const measurer = new TextMeasurer({ font: '14px Arial' })
    expect(measurer.measureText('Hello')).toBe(50)
  })

  it('caches measurements by default', () => {
    const measurer = new TextMeasurer({ font: '14px Arial' })

    expect(measurer.getCacheSize()).toBe(0)
    measurer.measureText('Hello')
    expect(measurer.getCacheSize()).toBe(1)
    measurer.measureText('Hello')
    expect(measurer.getCacheSize()).toBe(1)
  })

  it('does not cache when cacheEnabled is false', () => {
    const measurer = new TextMeasurer({
      font: '14px Arial',
      cacheEnabled: false,
    })

    measurer.measureText('Hello')
    expect(measurer.getCacheSize()).toBe(0)
  })

  it('setFont clears the cache', () => {
    const measurer = new TextMeasurer({ font: '14px Arial' })
    measurer.measureText('Hello')
    expect(measurer.getCacheSize()).toBe(1)

    measurer.setFont('16px Arial')
    expect(measurer.getCacheSize()).toBe(0)
  })

  it('falls back to character-based estimation without a context', () => {
    stubGetContext(null)
    const measurer = new TextMeasurer({ font: '10px Arial' })

    // 'Ab' -> upper 0.7 + lower 0.5, scaled by fontSize 10 => 12
    expect(measurer.measureText('Ab')).toBeCloseTo(12)
  })

  it('estimation defaults to 16px when the font has no px size', () => {
    stubGetContext(null)
    const measurer = new TextMeasurer({ font: 'bold Arial' })

    // 'A' -> 0.7 * 16 = 11.2
    expect(measurer.measureText('A')).toBeCloseTo(11.2)
  })
})

describe('TextMeasurer.measureItem', () => {
  it('adds the item style to the measured text width', () => {
    const measurer = new TextMeasurer({ font: '14px Arial' })

    // default style adds 8+8 padding + 4 margin + 1*2 border = 22
    expect(measurer.measureItem({ key: 1, text: 'Hello' })).toEqual({
      key: 1,
      text: 'Hello',
      textWidth: 50,
      totalWidth: 72,
    })
  })

  it('respects a custom item style', () => {
    const measurer = new TextMeasurer({
      font: '14px Arial',
      itemStyle: {
        paddingLeft: 0,
        paddingRight: 0,
        marginRight: 0,
        borderWidth: 0,
      },
    })

    expect(measurer.measureItem({ key: 1, text: 'Hello' }).totalWidth).toBe(50)
  })

  it('measureItems measures every item', () => {
    const measurer = new TextMeasurer({ font: '14px Arial' })
    const result = measurer.measureItems([
      { key: 1, text: 'Hi' },
      { key: 2, text: 'Hello' },
    ])

    expect(result.map((i) => i.textWidth)).toEqual([20, 50])
  })
})

describe('TextMeasurer misc', () => {
  it('getItemStyle returns a copy', () => {
    const measurer = new TextMeasurer({ font: '14px Arial' })
    const style = measurer.getItemStyle()
    style.paddingLeft = 999

    expect(measurer.getItemStyle().paddingLeft).not.toBe(999)
  })

  it('destroy clears the cache', () => {
    const measurer = new TextMeasurer({ font: '14px Arial' })
    measurer.measureText('Hello')

    measurer.destroy()

    expect(measurer.getCacheSize()).toBe(0)
  })
})

describe('shared measurer helpers', () => {
  it('getSharedMeasurer returns a singleton', () => {
    expect(getSharedMeasurer()).toBe(getSharedMeasurer())
  })

  it('measureTextWidth returns a numeric width', () => {
    expect(measureTextWidth('Hello', '14px Arial')).toBeTypeOf('number')
  })
})
