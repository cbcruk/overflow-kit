import type { MeasuredItem, OverflowResult, CalculatorOptions } from './types'
import {
  DEFAULT_GAP,
  DEFAULT_REST_INDICATOR_WIDTH,
  DEFAULT_CONTAINER_PADDING,
  defaultRestIndicatorText,
} from './utils'

interface ResolvedOptions {
  gap: number
  restIndicatorWidth: number
  containerPadding: number
  restIndicatorText: (count: number) => string
}

/**
 * Calculates which items should be visible and which should be hidden
 * based on container width.
 *
 * @example
 * ```ts
 * const calculator = new OverflowCalculator({ gap: 8 })
 * calculator.setItems(measuredItems)
 * const result = calculator.calculate(300)
 * console.log(result.visibleCount, result.hiddenCount)
 * ```
 */
export class OverflowCalculator {
  private items: MeasuredItem[] = []
  private options: ResolvedOptions

  private visibleItems: MeasuredItem[] = []
  private hiddenItems: MeasuredItem[] = []
  private totalItemsWidth: number = 0
  private currentWidth: number = 0

  constructor(options?: CalculatorOptions) {
    this.options = {
      gap: options?.gap ?? DEFAULT_GAP,
      restIndicatorWidth:
        options?.restIndicatorWidth ?? DEFAULT_REST_INDICATOR_WIDTH,
      containerPadding: options?.containerPadding ?? DEFAULT_CONTAINER_PADDING,
      restIndicatorText: options?.restIndicatorText ?? defaultRestIndicatorText,
    }
  }

  /**
   * Sets the items to calculate overflow for.
   * @param items - Pre-measured items with width information
   */
  setItems(items: MeasuredItem[]): void {
    this.items = items
  }

  /**
   * Calculates which items fit within the container width.
   * @param containerWidth - Available container width (in pixels)
   * @returns Result containing visible and hidden items
   */
  calculate(containerWidth: number): OverflowResult {
    this.reset()

    if (this.items.length === 0) {
      return this.createResult()
    }

    this.calculateTotalWidth()

    const availableWidth = containerWidth - this.options.containerPadding * 2

    if (this.totalItemsWidth <= availableWidth) {
      this.visibleItems = [...this.items]

      return this.createResult()
    }

    this.partitionItems(availableWidth)

    return this.createResult()
  }

  /**
   * Generates rest indicator text using the configured function.
   * @param count - Number of hidden items
   * @returns Text like "+3"
   */
  getRestIndicatorText(count: number): string {
    return this.options.restIndicatorText(count)
  }

  private reset(): void {
    this.visibleItems = []
    this.hiddenItems = []
    this.totalItemsWidth = 0
    this.currentWidth = 0
  }

  private calculateTotalWidth(): void {
    for (const item of this.items) {
      this.totalItemsWidth += item.totalWidth
    }
    if (this.items.length > 1) {
      this.totalItemsWidth += this.options.gap * (this.items.length - 1)
    }
  }

  private partitionItems(availableWidth: number): void {
    const { gap, restIndicatorWidth } = this.options
    const maxWidthForItems = availableWidth - restIndicatorWidth - gap

    for (let i = 0; i < this.items.length; i++) {
      const item = this.items[i]
      const itemWidth = item.totalWidth + (i > 0 ? gap : 0)

      if (this.currentWidth + itemWidth <= maxWidthForItems) {
        this.currentWidth += itemWidth

        this.visibleItems.push(item)
      } else {
        this.hiddenItems.push(...this.items.slice(i))

        break
      }
    }
  }

  private createResult(): OverflowResult {
    return {
      visibleCount: this.visibleItems.length,
      hiddenCount: this.hiddenItems.length,
      visibleItems: this.visibleItems,
      hiddenItems: this.hiddenItems,
      totalItemsWidth: this.totalItemsWidth,
    }
  }
}

/**
 * Parameters for the calculateOverflow function.
 */
export interface CalculateOverflowParams {
  /** Pre-measured items with width information */
  items: MeasuredItem[]
  /** Available container width (in pixels) */
  containerWidth: number
  /** Optional calculation options */
  options?: CalculatorOptions
}

/**
 * Convenience function for one-off overflow calculation.
 * Creates a calculator internally and returns the result.
 *
 * @example
 * ```ts
 * const result = calculateOverflow({
 *   items: measuredItems,
 *   containerWidth: 300,
 *   options: { gap: 8 }
 * })
 * ```
 */
export function calculateOverflow(
  params: CalculateOverflowParams
): OverflowResult {
  const calculator = new OverflowCalculator(params.options)

  calculator.setItems(params.items)

  return calculator.calculate(params.containerWidth)
}

/**
 * Generates rest indicator text.
 * @param count - Number of hidden items
 * @param customText - Optional custom text generator function
 * @returns Text like "+3"
 */
export function getRestIndicatorText(
  count: number,
  customText?: (count: number) => string
): string {
  return (customText ?? defaultRestIndicatorText)(count)
}
