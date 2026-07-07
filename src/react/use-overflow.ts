import { useRef } from 'react'
import type { OverflowItem, OverflowResult } from '../core'
import { defaultRestIndicatorText } from '../core'
import { GeneratorCalculator } from '../generator'
import { useOverflowEngine } from './use-overflow-engine'
import type { OverflowEngine, UseOverflowResult } from './types'

/**
 * Options for {@link useOverflow}.
 */
export interface UseOverflowOptions {
  /** Gap between items (in pixels). @default 4 */
  gap?: number
  /** Width reserved for the rest indicator like "+3" (in pixels). @default 40 */
  restIndicatorWidth?: number
  /** Function to generate rest indicator text. @default (count) => `+${count}` */
  restIndicatorText?: (count: number) => string
  /** Padding inside the container (in pixels). @default 0 */
  containerPadding?: number
  /** CSS class applied to hidden measurement elements (auto mode). */
  itemClassName?: string
  /** Inline styles applied to hidden measurement elements (auto mode). */
  itemStyle?: Partial<CSSStyleDeclaration>
  /**
   * Resolve a rendered DOM element by item key (manual mode). When provided,
   * items are measured from their real elements instead of a hidden container.
   */
  getElement?: (key: string | number) => HTMLElement | null
}

/**
 * Measures items with the DOM and returns which ones fit the container.
 *
 * By default (auto mode) items are measured in a hidden off-screen container,
 * so you only render the visible ones. Provide `getElement` to measure your
 * already-rendered elements instead.
 *
 * @example
 * ```tsx
 * function Tags({ tags }: { tags: OverflowItem[] }) {
 *   const { containerRef, visibleItems, hiddenCount, getRestIndicatorText } =
 *     useOverflow(tags, { gap: 8, itemClassName: 'tag' })
 *
 *   return (
 *     <div ref={containerRef} style={{ display: 'flex', gap: 8 }}>
 *       {visibleItems.map((item) => (
 *         <span key={item.key} className="tag">{item.text}</span>
 *       ))}
 *       {hiddenCount > 0 && <span className="tag">{getRestIndicatorText(hiddenCount)}</span>}
 *     </div>
 *   )
 * }
 * ```
 */
export function useOverflow<E extends HTMLElement = HTMLDivElement>(
  items: OverflowItem[],
  options: UseOverflowOptions = {}
): UseOverflowResult<E> {
  const {
    gap,
    restIndicatorWidth,
    containerPadding,
    itemClassName,
    itemStyle,
    restIndicatorText,
    getElement,
  } = options

  // Read the latest callbacks without forcing an engine rebuild.
  const restTextRef = useRef(restIndicatorText)
  restTextRef.current = restIndicatorText
  const getElementRef = useRef(getElement)
  getElementRef.current = getElement

  const recreateKey = JSON.stringify({
    gap,
    restIndicatorWidth,
    containerPadding,
    itemClassName,
    itemStyle: itemStyle ?? null,
    manual: Boolean(getElement),
  })

  const createEngine = (
    onResize: (result: OverflowResult) => void
  ): OverflowEngine => {
    const calculator = new GeneratorCalculator({
      gap,
      restIndicatorWidth,
      containerPadding,
      itemClassName,
      itemStyle,
      restIndicatorText: (count) =>
        (restTextRef.current ?? defaultRestIndicatorText)(count),
      getElement: getElementRef.current
        ? (key) => getElementRef.current?.(key) ?? null
        : undefined,
      onResize: (result) => onResize(result),
    })

    return {
      setItems: (next) => calculator.setItems(next),
      compute: (width) => calculator.runToCompletion(width),
      observe: (element) => calculator.observeContainer(element),
      getRestIndicatorText: (count) => calculator.getRestIndicatorText(count),
      destroy: () => calculator.reset(),
    }
  }

  return useOverflowEngine<E>(items, createEngine, recreateKey)
}
