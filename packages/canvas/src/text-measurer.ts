import type {
  ItemStyle,
  MeasuredItem,
  OverflowItem,
  MeasurerOptions,
} from '@overflow-kit/core'
import {
  getFontFromElement,
  DEFAULT_ITEM_STYLE,
  calculateItemTotalWidth,
  mergeItemStyle,
} from '@overflow-kit/core'

/**
 * Measures text width using Canvas 2D API.
 * Falls back to character-based estimation when Canvas is unavailable.
 *
 * @example
 * ```ts
 * const measurer = new TextMeasurer({ font: '16px Arial' })
 * const width = measurer.measureText('Hello')
 * const item = measurer.measureItem({ key: 1, text: 'Hello' })
 * ```
 */
export class TextMeasurer {
  private canvas: HTMLCanvasElement | null = null
  private ctx: CanvasRenderingContext2D | null = null
  private font: string | null = null
  private itemStyle: Required<ItemStyle>
  private cache: Map<string, number> = new Map()
  private cacheEnabled: boolean

  constructor(options: MeasurerOptions = {}) {
    this.font = this.resolveFont(options)
    this.itemStyle = mergeItemStyle(DEFAULT_ITEM_STYLE, options.itemStyle)
    this.cacheEnabled = options.cacheEnabled ?? true

    this.initCanvas()
  }

  private resolveFont(options: MeasurerOptions): string | null {
    if (options.font) return options.font
    if (options.element) return getFontFromElement(options.element)
    return null
  }

  private initCanvas(): void {
    if (typeof document === 'undefined') return

    this.canvas = document.createElement('canvas')
    this.ctx = this.canvas.getContext('2d')

    if (this.ctx && this.font) {
      this.ctx.font = this.font
    }
  }

  /**
   * Sets the font for text measurement.
   * Clears the cache since measurements depend on font.
   * @param font - CSS font string (e.g., "16px Arial")
   */
  setFont(font: string): void {
    this.font = font

    if (this.ctx) {
      this.ctx.font = font
    }

    this.clearCache()
  }

  /**
   * Sets font by extracting it from a DOM element.
   * @param element - DOM element to extract font from
   */
  setFontFromElement(element: HTMLElement): void {
    this.setFont(getFontFromElement(element))
  }

  /**
   * Updates item style properties.
   * @param style - Partial style to merge with current style
   */
  setItemStyle(style: Partial<ItemStyle>): void {
    this.itemStyle = mergeItemStyle(this.itemStyle, style)
  }

  /**
   * Measures the width of text using Canvas API.
   * Falls back to estimation if Canvas is unavailable.
   * @param text - Text to measure
   * @returns Width in pixels
   */
  measureText(text: string): number {
    if (!this.ctx || !this.font) {
      return this.estimateWidth(text)
    }

    const cacheKey = `${this.font}:${text}`

    if (this.cacheEnabled && this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!
    }

    const metrics = this.ctx.measureText(text)
    const width = metrics.width

    if (this.cacheEnabled) {
      this.cache.set(cacheKey, width)
    }

    return width
  }

  private estimateWidth(text: string): number {
    const fontSize = this.extractFontSize()

    return [...text].reduce(
      (width, char) => width + fontSize * this.getCharWidthRatio(char),
      0
    )
  }

  private extractFontSize(): number {
    if (!this.font) return 16

    const match = this.font.match(/(\d+)px/)

    return match ? parseInt(match[1], 10) : 16
  }

  private getCharWidthRatio(char: string): number {
    if (/[\u3131-\uD79D]/.test(char)) return 1
    if (/[A-Z]/.test(char)) return 0.7
    if (/[a-z]/.test(char)) return 0.5
    if (/[0-9]/.test(char)) return 0.6
    if (/\s/.test(char)) return 0.25
    return 0.6
  }

  /**
   * Measures a single item and returns it with width information.
   * @param item - Item to measure
   * @returns Item with textWidth and totalWidth
   */
  measureItem(item: OverflowItem): MeasuredItem {
    const textWidth = this.measureText(item.text)
    const totalWidth = calculateItemTotalWidth(textWidth, this.itemStyle)

    return {
      ...item,
      textWidth,
      totalWidth,
    }
  }

  /**
   * Measures multiple items.
   * @param items - Items to measure
   * @returns Items with width information
   */
  measureItems(items: OverflowItem[]): MeasuredItem[] {
    return items.map((item) => this.measureItem(item))
  }

  /**
   * Returns a copy of the current item style.
   */
  getItemStyle(): Required<ItemStyle> {
    return { ...this.itemStyle }
  }

  /**
   * Clears the measurement cache.
   */
  clearCache(): void {
    this.cache.clear()
  }

  /**
   * Returns the number of cached measurements.
   */
  getCacheSize(): number {
    return this.cache.size
  }

  /**
   * Cleans up resources. Call when done using the measurer.
   */
  destroy(): void {
    this.cache.clear()
    this.canvas = null
    this.ctx = null
  }
}

let sharedMeasurer: TextMeasurer | null = null

/**
 * Returns a shared TextMeasurer instance.
 * Creates one if it doesn't exist.
 * @param options - Options for creating the measurer (only used on first call)
 */
export function getSharedMeasurer(options?: MeasurerOptions): TextMeasurer {
  if (!sharedMeasurer) {
    sharedMeasurer = new TextMeasurer(options)
  }

  return sharedMeasurer
}

/**
 * Convenience function to measure text width using the shared measurer.
 * @param text - Text to measure
 * @param font - Optional CSS font string
 * @returns Width in pixels
 */
export function measureTextWidth(text: string, font?: string): number {
  const measurer = getSharedMeasurer(font ? { font } : undefined)

  return measurer.measureText(text)
}
