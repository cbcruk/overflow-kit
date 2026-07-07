// @vitest-environment happy-dom
import { describe, it, expect, beforeAll } from 'vitest'
import { AutoMeasurer } from './auto-measurer'
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
  { key: 1, text: 'Alpha' }, // 50px
  { key: 2, text: 'Be' }, // 20px
]

describe('AutoMeasurer', () => {
  it('measures items in a temporary off-screen container', () => {
    const measurer = new AutoMeasurer()

    const result = measurer.measureAll(ITEMS)

    expect(result.get(1)?.totalWidth).toBe(50)
    expect(result.get(2)?.totalWidth).toBe(20)
  })

  it('removes its measurement container from the document afterwards', () => {
    const measurer = new AutoMeasurer()

    measurer.measureAll(ITEMS)

    expect(document.querySelectorAll('[data-overflow-measurer]')).toHaveLength(
      0
    )
  })

  it('applies itemClassName to measurement elements', () => {
    let capturedClass: string | null = null
    const measurer = new AutoMeasurer({ itemClassName: 'chip' })

    // Intercept append to inspect the created element before cleanup.
    const original = window.Element.prototype.getBoundingClientRect
    window.Element.prototype.getBoundingClientRect = function () {
      if (this instanceof window.HTMLElement && this.textContent === 'Alpha') {
        capturedClass = this.className
      }
      return original.call(this)
    }

    measurer.measureAll([{ key: 1, text: 'Alpha' }])

    window.Element.prototype.getBoundingClientRect = original
    expect(capturedClass).toBe('chip')
  })

  it('destroy() is safe to call without measuring', () => {
    const measurer = new AutoMeasurer()
    expect(() => measurer.destroy()).not.toThrow()
  })
})
