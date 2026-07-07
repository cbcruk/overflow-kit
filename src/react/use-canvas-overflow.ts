import { useRef } from 'react'
import type { ItemStyle, OverflowItem, OverflowResult } from '../core'
import { defaultRestIndicatorText } from '../core'
import { CanvasCalculator } from '../canvas'
import { useOverflowEngine } from './use-overflow-engine'
import type { OverflowEngine, UseOverflowResult } from './types'

/**
 * Options for {@link useCanvasOverflow}.
 */
export interface UseCanvasOverflowOptions {
  /** CSS font string used for measurement (e.g. "14px Inter, sans-serif"). */
  font?: string
  /** Style properties added to each measured item to estimate its total width. */
  itemStyle?: ItemStyle
  /** Whether to cache text measurements. @default true */
  cacheEnabled?: boolean
  /** Gap between items (in pixels). @default 4 */
  gap?: number
  /** Width reserved for the rest indicator like "+3" (in pixels). @default 40 */
  restIndicatorWidth?: number
  /** Function to generate rest indicator text. @default (count) => `+${count}` */
  restIndicatorText?: (count: number) => string
  /** Padding inside the container (in pixels). @default 0 */
  containerPadding?: number
}

/**
 * Measures item text with the Canvas API — no DOM rendering required — and
 * returns which items fit the container. Faster than {@link useOverflow} for
 * text-only items, at the cost of estimating padding/border from `itemStyle`.
 *
 * @example
 * ```tsx
 * function Tabs({ tabs }: { tabs: OverflowItem[] }) {
 *   const { containerRef, visibleItems, hiddenCount, getRestIndicatorText } =
 *     useCanvasOverflow(tabs, { font: '14px Inter', gap: 8 })
 *
 *   return (
 *     <div ref={containerRef}>
 *       {visibleItems.map((item) => <span key={item.key}>{item.text}</span>)}
 *       {hiddenCount > 0 && <span>{getRestIndicatorText(hiddenCount)}</span>}
 *     </div>
 *   )
 * }
 * ```
 */
export function useCanvasOverflow<E extends HTMLElement = HTMLDivElement>(
  items: OverflowItem[],
  options: UseCanvasOverflowOptions = {}
): UseOverflowResult<E> {
  const {
    font,
    itemStyle,
    cacheEnabled,
    gap,
    restIndicatorWidth,
    containerPadding,
    restIndicatorText,
  } = options

  const restTextRef = useRef(restIndicatorText)
  restTextRef.current = restIndicatorText

  const recreateKey = JSON.stringify({
    font: font ?? null,
    itemStyle: itemStyle ?? null,
    cacheEnabled: cacheEnabled ?? null,
    gap,
    restIndicatorWidth,
    containerPadding,
  })

  const createEngine = (
    onResize: (result: OverflowResult) => void
  ): OverflowEngine => {
    const calculator = new CanvasCalculator({
      font,
      itemStyle,
      cacheEnabled,
      gap,
      restIndicatorWidth,
      containerPadding,
      restIndicatorText: (count) =>
        (restTextRef.current ?? defaultRestIndicatorText)(count),
      onResize: (result) => onResize(result),
    })

    return {
      setItems: (next) => calculator.setItems(next),
      compute: (width) => calculator.calculate(width),
      observe: (element) => calculator.observeContainer(element),
      getRestIndicatorText: (count) => calculator.getRestIndicatorText(count),
      destroy: () => calculator.destroy(),
    }
  }

  return useOverflowEngine<E>(items, createEngine, recreateKey)
}
