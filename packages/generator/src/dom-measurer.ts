import type { OverflowItem, MeasuredItem } from '@overflow-kit/core'

/**
 * Options for DomMeasurer.
 */
export interface DomMeasurerOptions {
  /** Function to retrieve DOM element by item key */
  getElement: (key: string | number) => HTMLElement | null
}

/**
 * Measures item dimensions using actual DOM elements.
 * Provides accurate measurements by reading rendered element sizes.
 *
 * @example
 * ```ts
 * const measurer = new DomMeasurer({
 *   getElement: (key) => document.getElementById(`item-${key}`)
 * })
 * const measured = measurer.measureItem({ key: 1, text: 'Hello' })
 * ```
 */
export class DomMeasurer {
  private getElement: (key: string | number) => HTMLElement | null

  constructor(options: DomMeasurerOptions) {
    this.getElement = options.getElement
  }

  /**
   * Measures a single item using its DOM element.
   * @param item - Item to measure
   * @returns Measured item with width, or null if element not found
   */
  measureItem(item: OverflowItem): MeasuredItem | null {
    const element = this.getElement(item.key)

    if (!element) {
      return null
    }

    const rect = element.getBoundingClientRect()

    return {
      ...item,
      textWidth: rect.width,
      totalWidth: rect.width,
    }
  }

  /**
   * Measures multiple items using their DOM elements.
   * Skips items whose elements are not found.
   * @param items - Items to measure
   * @returns Array of successfully measured items
   */
  measureItems(items: OverflowItem[]): MeasuredItem[] {
    const results: MeasuredItem[] = []

    for (const item of items) {
      const measured = this.measureItem(item)

      if (measured) {
        results.push(measured)
      }
    }

    return results
  }

  /**
   * Measures all items and returns a Map keyed by item key.
   * @param items - Items to measure
   * @returns Map of item key to measured item
   */
  measureAll(items: OverflowItem[]): Map<string | number, MeasuredItem> {
    const measurements = new Map<string | number, MeasuredItem>()

    for (const item of items) {
      const measured = this.measureItem(item)

      if (measured) {
        measurements.set(item.key, measured)
      }
    }

    return measurements
  }
}

/**
 * Measures width and height of a DOM element.
 * @param element - DOM element to measure
 * @returns Object containing width and height in pixels
 */
export function measureElement(element: HTMLElement): {
  width: number
  height: number
} {
  const rect = element.getBoundingClientRect()

  return {
    width: rect.width,
    height: rect.height,
  }
}

/**
 * Measures multiple DOM elements.
 * @param elements - Map of key to DOM element
 * @returns Map of key to dimensions
 */
export function measureElements(
  elements: Map<string | number, HTMLElement>
): Map<string | number, { width: number; height: number }> {
  const measurements = new Map<
    string | number,
    { width: number; height: number }
  >()

  elements.forEach((element, key) => {
    measurements.set(key, measureElement(element))
  })

  return measurements
}
