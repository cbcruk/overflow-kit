import { describe, it, expect } from 'vitest'
import {
  DEFAULT_ITEM_STYLE,
  DEFAULT_GAP,
  DEFAULT_REST_INDICATOR_WIDTH,
  DEFAULT_CONTAINER_PADDING,
  defaultRestIndicatorText,
  calculateItemTotalWidth,
  mergeItemStyle,
} from './utils'

describe('constants', () => {
  it('DEFAULT_ITEM_STYLE has expected values', () => {
    expect(DEFAULT_ITEM_STYLE).toEqual({
      paddingLeft: 8,
      paddingRight: 8,
      paddingTop: 4,
      paddingBottom: 4,
      marginLeft: 0,
      marginRight: 4,
      marginTop: 0,
      marginBottom: 0,
      borderWidth: 1,
    })
  })

  it('DEFAULT_GAP is 4', () => {
    expect(DEFAULT_GAP).toBe(4)
  })

  it('DEFAULT_REST_INDICATOR_WIDTH is 40', () => {
    expect(DEFAULT_REST_INDICATOR_WIDTH).toBe(40)
  })

  it('DEFAULT_CONTAINER_PADDING is 0', () => {
    expect(DEFAULT_CONTAINER_PADDING).toBe(0)
  })
})

describe('defaultRestIndicatorText', () => {
  it('returns "+1" for count 1', () => {
    expect(defaultRestIndicatorText(1)).toBe('+1')
  })

  it('returns "+5" for count 5', () => {
    expect(defaultRestIndicatorText(5)).toBe('+5')
  })

  it('returns "+0" for count 0', () => {
    expect(defaultRestIndicatorText(0)).toBe('+0')
  })
})

describe('calculateItemTotalWidth', () => {
  it('calculates total width with default style', () => {
    const textWidth = 100
    const result = calculateItemTotalWidth(textWidth, DEFAULT_ITEM_STYLE)

    // textWidth + paddingLeft + paddingRight + marginLeft + marginRight + borderWidth * 2
    // 100 + 8 + 8 + 0 + 4 + 1 * 2 = 122
    expect(result).toBe(122)
  })

  it('calculates total width with custom style', () => {
    const textWidth = 50
    const style = {
      paddingLeft: 10,
      paddingRight: 10,
      paddingTop: 0,
      paddingBottom: 0,
      marginLeft: 5,
      marginRight: 5,
      marginTop: 0,
      marginBottom: 0,
      borderWidth: 2,
    }
    const result = calculateItemTotalWidth(textWidth, style)

    // 50 + 10 + 10 + 5 + 5 + 2 * 2 = 84
    expect(result).toBe(84)
  })

  it('handles zero textWidth', () => {
    const result = calculateItemTotalWidth(0, DEFAULT_ITEM_STYLE)

    // 0 + 8 + 8 + 0 + 4 + 1 * 2 = 22
    expect(result).toBe(22)
  })
})

describe('mergeItemStyle', () => {
  it('returns base style when override is undefined', () => {
    const result = mergeItemStyle(DEFAULT_ITEM_STYLE, undefined)

    expect(result).toEqual(DEFAULT_ITEM_STYLE)
  })

  it('merges partial override with base', () => {
    const override = { paddingLeft: 20, marginRight: 10 }
    const result = mergeItemStyle(DEFAULT_ITEM_STYLE, override)

    expect(result).toEqual({
      ...DEFAULT_ITEM_STYLE,
      paddingLeft: 20,
      marginRight: 10,
    })
  })

  it('completely overrides all properties', () => {
    const override = {
      paddingLeft: 1,
      paddingRight: 2,
      paddingTop: 3,
      paddingBottom: 4,
      marginLeft: 5,
      marginRight: 6,
      marginTop: 7,
      marginBottom: 8,
      borderWidth: 9,
    }
    const result = mergeItemStyle(DEFAULT_ITEM_STYLE, override)

    expect(result).toEqual(override)
  })

  it('returns same reference when override is undefined', () => {
    const result = mergeItemStyle(DEFAULT_ITEM_STYLE, undefined)

    expect(result).toBe(DEFAULT_ITEM_STYLE)
  })

  it('returns new object when override is provided', () => {
    const result = mergeItemStyle(DEFAULT_ITEM_STYLE, { paddingLeft: 8 })

    expect(result).not.toBe(DEFAULT_ITEM_STYLE)
  })
})
