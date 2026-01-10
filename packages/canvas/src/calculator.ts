import type {
  OverflowItem,
  OverflowResult,
  CalculatorOptions,
  MeasuredItem,
  ItemStyle,
} from '@overflow-kit/core'
import { calculateOverflow, getRestIndicatorText } from '@overflow-kit/core'
import {
  createResizeObserverManager,
  type ResizeObserverManager,
} from '@overflow-kit/utils'
import { TextMeasurer } from './text-measurer'

/**
 * Options for CanvasCalculator.
 * Combines measurement options and calculation options.
 */
export interface CanvasCalculatorOptions {
  /** CSS font string (e.g., "16px Arial") */
  font?: string
  /** DOM element to extract font from */
  element?: HTMLElement
  /** Style properties for calculating item dimensions */
  itemStyle?: ItemStyle
  /** Whether to cache measurement results. @default true */
  cacheEnabled?: boolean
  /** Gap between items (in pixels). @default 8 */
  gap?: number
  /** Width reserved for rest indicator (in pixels). @default 40 */
  restIndicatorWidth?: number
  /** Function to generate rest indicator text */
  restIndicatorText?: (count: number) => string
  /** Padding inside the container (in pixels). @default 0 */
  containerPadding?: number
  /** Container element to observe for size changes */
  containerElement?: HTMLElement
  /** Callback invoked when container size changes */
  onResize?: (result: OverflowResult, width: number) => void
}

/**
 * Combines text measurement and overflow calculation using Canvas API.
 * Manages measured items and provides methods for incremental updates.
 *
 * @example
 * ```ts
 * const calculator = new CanvasCalculator({ font: '16px Arial', gap: 8 })
 * calculator.setItems([{ key: 1, text: 'Hello' }, { key: 2, text: 'World' }])
 * const result = calculator.calculate(300)
 * console.log(result.visibleItems, result.hiddenItems)
 * ```
 */
export class CanvasCalculator {
  private measurer: TextMeasurer
  private options: CalculatorOptions
  private measuredItems: Map<string | number, MeasuredItem> = new Map()
  private resizeObserverManager: ResizeObserverManager
  private onResizeCallback?: (result: OverflowResult, width: number) => void

  constructor(options: CanvasCalculatorOptions = {}) {
    this.measurer = new TextMeasurer({
      font: options.font,
      element: options.element,
      itemStyle: options.itemStyle,
      cacheEnabled: options.cacheEnabled,
    })

    this.options = {
      gap: options.gap,
      restIndicatorWidth: options.restIndicatorWidth,
      restIndicatorText: options.restIndicatorText,
      containerPadding: options.containerPadding,
    }

    this.onResizeCallback = options.onResize

    this.resizeObserverManager = createResizeObserverManager({
      onResize: (width) => {
        if (this.onResizeCallback && this.measuredItems.size > 0) {
          const result = this.calculate(width)
          this.onResizeCallback(result, width)
        }
      },
    })

    if (options.containerElement) {
      this.observeContainer(options.containerElement)
    }
  }

  /**
   * Starts observing a container element for size changes.
   * @param element - Container element to observe
   */
  observeContainer(element: HTMLElement): void {
    this.resizeObserverManager.observe(element)
  }

  /**
   * Stops observing the container element.
   */
  disconnectObserver(): void {
    this.resizeObserverManager.disconnect()
  }

  /**
   * Sets items to calculate overflow for. Measures all items.
   * @param items - Items to measure and store
   */
  setItems(items: OverflowItem[]): void {
    this.measuredItems.clear()

    const measured = this.measurer.measureItems(items)

    measured.forEach((item) => {
      this.measuredItems.set(item.key, item)
    })
  }

  /**
   * Adds a single item. Useful for incremental updates.
   * @param item - Item to add
   * @returns The measured item
   */
  addItem(item: OverflowItem): MeasuredItem {
    const measured = this.measurer.measureItem(item)

    this.measuredItems.set(item.key, measured)

    return measured
  }

  /**
   * Removes an item by key.
   * @param key - Key of the item to remove
   */
  removeItem(key: string | number): void {
    this.measuredItems.delete(key)
  }

  /**
   * Calculates which items fit within the container width.
   * @param containerWidth - Available container width (in pixels)
   * @returns Result containing visible and hidden items
   */
  calculate(containerWidth: number): OverflowResult {
    const items = Array.from(this.measuredItems.values())

    return calculateOverflow({
      items,
      containerWidth,
      options: this.options,
    })
  }

  /**
   * Generates rest indicator text.
   * @param count - Number of hidden items
   * @returns Text like "+3"
   */
  getRestIndicatorText(count: number): string {
    return getRestIndicatorText(count, this.options.restIndicatorText)
  }

  /**
   * Returns a measured item by key.
   * @param key - Key of the item
   */
  getMeasuredItem(key: string | number): MeasuredItem | undefined {
    return this.measuredItems.get(key)
  }

  /**
   * Returns all measured items.
   */
  getAllMeasuredItems(): MeasuredItem[] {
    return Array.from(this.measuredItems.values())
  }

  /**
   * Updates options and re-measures items if needed.
   * @param options - Partial options to update
   */
  updateOptions(options: Partial<CanvasCalculatorOptions>): void {
    if (options.font) {
      this.measurer.setFont(options.font)
    }

    if (options.itemStyle) {
      this.measurer.setItemStyle(options.itemStyle)
    }

    this.options = {
      ...this.options,
      gap: options.gap ?? this.options.gap,
      restIndicatorWidth:
        options.restIndicatorWidth ?? this.options.restIndicatorWidth,
      restIndicatorText:
        options.restIndicatorText ?? this.options.restIndicatorText,
      containerPadding:
        options.containerPadding ?? this.options.containerPadding,
    }

    const items = Array.from(this.measuredItems.values()).map((item) => ({
      key: item.key,
      text: item.text,
    }))

    this.setItems(items)
  }

  /**
   * Cleans up resources. Call when done using the calculator.
   */
  destroy(): void {
    this.disconnectObserver()
    this.measurer.destroy()
    this.measuredItems.clear()
  }
}

/**
 * Convenience function for one-off overflow calculation with Canvas measurement.
 *
 * @example
 * ```ts
 * const result = calculateWithCanvas(
 *   [{ key: 1, text: 'Hello' }],
 *   300,
 *   { font: '16px Arial' }
 * )
 * ```
 */
export function calculateWithCanvas(
  items: OverflowItem[],
  containerWidth: number,
  options?: CanvasCalculatorOptions
): OverflowResult {
  const calculator = new CanvasCalculator(options)

  calculator.setItems(items)

  const result = calculator.calculate(containerWidth)

  calculator.destroy()

  return result
}
