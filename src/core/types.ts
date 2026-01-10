/**
 * Style properties for calculating item dimensions.
 * All values are in pixels.
 */
export interface ItemStyle {
  paddingLeft?: number
  paddingRight?: number
  paddingTop?: number
  paddingBottom?: number
  marginLeft?: number
  marginRight?: number
  marginTop?: number
  marginBottom?: number
  borderWidth?: number
}

/**
 * An item to be measured and potentially hidden on overflow.
 */
export interface OverflowItem {
  /** Unique identifier for the item */
  key: string | number
  /** Text content to be measured */
  text: string
}

/**
 * An item with measured width values.
 */
export interface MeasuredItem extends OverflowItem {
  /** Width of the text content only (in pixels) */
  textWidth: number
  /** Total width including padding, margin, and border (in pixels) */
  totalWidth: number
}

/**
 * Result of overflow calculation.
 */
export interface OverflowResult {
  /** Number of items that fit within the container */
  visibleCount: number
  /** Number of items that overflow the container */
  hiddenCount: number
  /** Items that fit within the container */
  visibleItems: MeasuredItem[]
  /** Items that overflow the container */
  hiddenItems: MeasuredItem[]
  /** Total width of all items including gaps (in pixels) */
  totalItemsWidth: number
}

/**
 * Options for overflow calculation.
 */
export interface CalculatorOptions {
  /** Gap between items (in pixels). @default 8 */
  gap?: number
  /** Width reserved for the rest indicator like "+3" (in pixels). @default 40 */
  restIndicatorWidth?: number
  /** Function to generate rest indicator text. @default (count) => `+${count}` */
  restIndicatorText?: (count: number) => string
  /** Padding inside the container (in pixels). @default 0 */
  containerPadding?: number
}

/**
 * Options for text measurement.
 */
export interface MeasurerOptions {
  /** CSS font string (e.g., "16px Arial"). Takes precedence over element. */
  font?: string
  /** DOM element to extract font style from using getComputedStyle. */
  element?: HTMLElement
  /** Style properties for calculating item dimensions. */
  itemStyle?: ItemStyle
  /** Whether to cache measurement results. @default true */
  cacheEnabled?: boolean
}
