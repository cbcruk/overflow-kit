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

describe('default constants', () => {
  it('exposes the documented default values', () => {
    expect(DEFAULT_GAP).toBe(4)
    expect(DEFAULT_REST_INDICATOR_WIDTH).toBe(40)
    expect(DEFAULT_CONTAINER_PADDING).toBe(0)
  })
})

describe('defaultRestIndicatorText', () => {
  it('formats the count as "+N"', () => {
    expect(defaultRestIndicatorText(0)).toBe('+0')
    expect(defaultRestIndicatorText(7)).toBe('+7')
  })
})

describe('calculateItemTotalWidth', () => {
  it('adds horizontal padding, margin, and both borders', () => {
    // 100 + paddingL 8 + paddingR 8 + marginL 0 + marginR 4 + border 1 * 2 = 122
    expect(calculateItemTotalWidth(100, DEFAULT_ITEM_STYLE)).toBe(122)
  })

  it('ignores vertical spacing', () => {
    const style = { ...DEFAULT_ITEM_STYLE, paddingTop: 99, marginBottom: 99 }
    expect(calculateItemTotalWidth(100, style)).toBe(122)
  })

  it('scales border contribution by two', () => {
    const style = { ...DEFAULT_ITEM_STYLE, borderWidth: 3 }
    // 122 was with border 1 (contributes 2); border 3 contributes 6 -> +4
    expect(calculateItemTotalWidth(100, style)).toBe(126)
  })
})

describe('mergeItemStyle', () => {
  it('returns the base style unchanged when no override is given', () => {
    expect(mergeItemStyle(DEFAULT_ITEM_STYLE)).toEqual(DEFAULT_ITEM_STYLE)
  })

  it('overrides only the provided properties', () => {
    const merged = mergeItemStyle(DEFAULT_ITEM_STYLE, { paddingLeft: 20 })

    expect(merged.paddingLeft).toBe(20)
    expect(merged.paddingRight).toBe(DEFAULT_ITEM_STYLE.paddingRight)
  })

  it('does not mutate the base style', () => {
    const base = { ...DEFAULT_ITEM_STYLE }
    mergeItemStyle(base, { paddingLeft: 20 })

    expect(base.paddingLeft).toBe(DEFAULT_ITEM_STYLE.paddingLeft)
  })
})
