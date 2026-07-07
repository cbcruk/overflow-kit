import type { RefObject } from 'react'
import type { MeasuredItem, OverflowItem, OverflowResult } from '../core'

/**
 * Internal, strategy-agnostic surface consumed by {@link useOverflowEngine}.
 * Both the DOM and Canvas hooks adapt their calculator to this shape.
 */
export interface OverflowEngine {
  setItems(items: OverflowItem[]): void
  compute(containerWidth: number): OverflowResult
  observe(element: HTMLElement): void
  getRestIndicatorText(count: number): string
  destroy(): void
}

/**
 * Return value shared by {@link useOverflow} and {@link useCanvasOverflow}.
 *
 * @typeParam E - Element type of the container the ref is attached to.
 */
export interface UseOverflowResult<E extends HTMLElement = HTMLDivElement> {
  /** Attach to the container whose width drives the overflow calculation. */
  containerRef: RefObject<E>
  /** The full overflow result. */
  result: OverflowResult
  /** Items that fit within the container. */
  visibleItems: MeasuredItem[]
  /** Items that overflow and should be hidden. */
  hiddenItems: MeasuredItem[]
  /** Number of visible items. */
  visibleCount: number
  /** Number of hidden items (use for the "+N" indicator). */
  hiddenCount: number
  /** Formats the rest-indicator text, e.g. "+3". */
  getRestIndicatorText: (count: number) => string
  /** Forces a re-measure and recalculation against the current container width. */
  recalculate: () => void
}
