import type { ItemStyle } from './types'

/**
 * Extracts CSS font string from a DOM element using getComputedStyle.
 * @param element - The DOM element to extract font from
 * @returns CSS font string (e.g., "normal 400 16px Arial")
 */
export function getFontFromElement(element: HTMLElement): string {
  const style = window.getComputedStyle(element)

  return `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`
}

/** Default item style used when no custom style is provided. */
export const DEFAULT_ITEM_STYLE: Required<ItemStyle> = {
  paddingLeft: 8,
  paddingRight: 8,
  paddingTop: 4,
  paddingBottom: 4,
  marginLeft: 0,
  marginRight: 4,
  marginTop: 0,
  marginBottom: 0,
  borderWidth: 1,
}

/** Default gap between items (in pixels). */
export const DEFAULT_GAP = 4

/** Default width reserved for rest indicator (in pixels). */
export const DEFAULT_REST_INDICATOR_WIDTH = 40

/** Default container padding (in pixels). */
export const DEFAULT_CONTAINER_PADDING = 0

/**
 * Default function to generate rest indicator text.
 * @param count - Number of hidden items
 * @returns Text like "+3"
 */
export function defaultRestIndicatorText(count: number): string {
  return `+${count}`
}

/**
 * Calculates the total width of an item including padding, margin, and border.
 * @param textWidth - Width of the text content (in pixels)
 * @param itemStyle - Style properties for the item
 * @returns Total width (in pixels)
 */
export function calculateItemTotalWidth(
  textWidth: number,
  itemStyle: Required<ItemStyle>
): number {
  const { paddingLeft, paddingRight, marginLeft, marginRight, borderWidth } =
    itemStyle

  return (
    textWidth +
    paddingLeft +
    paddingRight +
    marginLeft +
    marginRight +
    borderWidth * 2
  )
}

/**
 * Merges base item style with optional override values.
 * @param base - Base style with all required properties
 * @param override - Optional partial style to override base values
 * @returns Merged style with all required properties
 */
export function mergeItemStyle(
  base: Required<ItemStyle>,
  override?: ItemStyle
): Required<ItemStyle> {
  if (!override) return base
  return { ...base, ...override }
}
