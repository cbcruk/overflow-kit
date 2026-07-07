// @vitest-environment happy-dom
import { describe, it, expect, beforeAll, afterEach } from 'vitest'
import { createElement } from 'react'
import { render, cleanup, renderHook } from '@testing-library/react'
import { useOverflow } from './use-overflow'
import type { OverflowItem } from '../core'

/**
 * happy-dom does not lay out elements, so we stub measurement deterministically:
 * every element is 10px per character wide, and the container reports whatever
 * width the current test sets. This lets us exercise real overflow branches.
 */
let containerWidth = 1000

beforeAll(() => {
  if (!('ResizeObserver' in globalThis)) {
    ;(globalThis as unknown as { ResizeObserver: unknown }).ResizeObserver =
      class {
        observe(): void {}
        unobserve(): void {}
        disconnect(): void {}
      }
  }

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

  Object.defineProperty(window.HTMLElement.prototype, 'clientWidth', {
    configurable: true,
    get: () => containerWidth,
  })
})

afterEach(() => {
  cleanup()
  containerWidth = 1000
})

// Widths: Dashboard/Analytics = 90px, Settings = 80px.
const ITEMS: OverflowItem[] = [
  { key: 1, text: 'Dashboard' },
  { key: 2, text: 'Analytics' },
  { key: 3, text: 'Settings' },
]

function Harness(props: { items: OverflowItem[] }) {
  const { containerRef, visibleItems, hiddenCount, getRestIndicatorText } =
    useOverflow<HTMLDivElement>(props.items, { gap: 4 })

  return createElement(
    'div',
    { ref: containerRef, 'data-testid': 'container' },
    visibleItems.map((item) =>
      createElement('span', { key: item.key, className: 'chip' }, item.text)
    ),
    hiddenCount > 0
      ? createElement(
          'em',
          { 'data-testid': 'rest' },
          getRestIndicatorText(hiddenCount)
        )
      : null
  )
}

const chips = (el: HTMLElement) => el.querySelectorAll('span.chip')

describe('useOverflow', () => {
  it('exposes a stable API surface and formats the rest indicator', () => {
    const { result } = renderHook(() => useOverflow(ITEMS))

    expect(typeof result.current.recalculate).toBe('function')
    expect(result.current.containerRef).toBeTruthy()
    expect(result.current.getRestIndicatorText(3)).toBe('+3')
  })

  it('renders every item when they all fit', () => {
    containerWidth = 1000

    const { getByTestId, queryByTestId } = render(
      createElement(Harness, { items: ITEMS })
    )

    expect(chips(getByTestId('container'))).toHaveLength(3)
    expect(queryByTestId('rest')).toBeNull()
  })

  it('hides overflowing items and shows the rest indicator', () => {
    // available 150; maxWidthForItems = 150 - 40 - 4 = 106
    // item 0 (90) fits; item 1 (90 + gap 4) would total 184 > 106 -> hidden
    containerWidth = 150

    const { getByTestId } = render(createElement(Harness, { items: ITEMS }))

    expect(chips(getByTestId('container'))).toHaveLength(1)
    expect(getByTestId('rest').textContent).toBe('+2')
  })

  it('reflects an updated item set on rerender', () => {
    containerWidth = 1000

    const { getByTestId, rerender } = render(
      createElement(Harness, { items: ITEMS })
    )
    expect(chips(getByTestId('container'))).toHaveLength(3)

    rerender(
      createElement(Harness, { items: [...ITEMS, { key: 4, text: 'Profile' }] })
    )

    expect(chips(getByTestId('container'))).toHaveLength(4)
  })
})
