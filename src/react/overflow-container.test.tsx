// @vitest-environment happy-dom
import { describe, it, expect, beforeAll, afterEach } from 'vitest'
import { render, cleanup } from '@testing-library/react'
import { OverflowContainer } from './overflow-container'
import type { OverflowItem } from '../core'

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

describe('OverflowContainer', () => {
  it('renders every item through renderItem when they fit', () => {
    containerWidth = 1000

    const { container } = render(
      <OverflowContainer
        items={ITEMS}
        options={{ gap: 4 }}
        renderItem={(item) => <span className="chip">{item.text}</span>}
      />
    )

    expect(container.querySelectorAll('span.chip')).toHaveLength(3)
  })

  it('falls back to the default "+N" rest indicator on overflow', () => {
    containerWidth = 150

    const { container } = render(
      <OverflowContainer
        items={ITEMS}
        options={{ gap: 4 }}
        renderItem={(item) => <span className="chip">{item.text}</span>}
      />
    )

    expect(container.querySelectorAll('span.chip')).toHaveLength(1)
    expect(container.textContent).toContain('+2')
  })

  it('uses a custom renderRest when provided', () => {
    containerWidth = 150

    const { getByTestId } = render(
      <OverflowContainer
        items={ITEMS}
        options={{ gap: 4 }}
        renderItem={(item) => <span className="chip">{item.text}</span>}
        renderRest={(count, hidden) => (
          <button data-testid="more">
            {count} more ({hidden.map((i) => i.text).join(', ')})
          </button>
        )}
      />
    )

    const more = getByTestId('more')
    expect(more.textContent).toBe('2 more (Analytics, Settings)')
  })

  it('supports the canvas strategy', () => {
    containerWidth = 1000

    const { container } = render(
      <OverflowContainer
        strategy="canvas"
        items={ITEMS}
        options={{ font: '14px sans-serif', gap: 4 }}
        renderItem={(item) => <span className="chip">{item.text}</span>}
      />
    )

    expect(container.querySelectorAll('span.chip')).toHaveLength(3)
  })
})
