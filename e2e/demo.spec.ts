import { test, expect, type Page, type Locator } from '@playwright/test'

/**
 * Sets an <input type="range"> value the way React expects (native value setter
 * + a bubbling `input` event), then returns once applied.
 */
async function setRange(slider: Locator, value: number): Promise<void> {
  await slider.evaluate((el, v) => {
    const setter = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype,
      'value'
    )?.set
    setter?.call(el, String(v))
    el.dispatchEvent(new Event('input', { bubbles: true }))
  }, value)
}

interface DemoSection {
  section: Locator
  items: Locator
  rest: Locator
  slider: Locator
  textInput: Locator
  addButton: Locator
}

function getSection(page: Page, heading: string): DemoSection {
  const section = page
    .locator('.demo-section')
    .filter({ has: page.getByRole('heading', { name: heading }) })

  return {
    section,
    items: section.locator('.demo-items > span:not(.demo-rest-indicator)'),
    rest: section.locator('.demo-rest-indicator'),
    slider: section.locator('input[type="range"]'),
    textInput: section.locator('input[type="text"]'),
    addButton: section.getByRole('button', { name: 'Add' }),
  }
}

const SECTIONS = [
  { name: 'OverflowContainer', heading: 'OverflowContainer' },
  { name: 'Canvas', heading: 'useCanvasOverflow' },
  { name: 'DOM', heading: 'useOverflow' },
]

test.beforeEach(async ({ page }) => {
  await page.goto('/overflow-kit/')
})

test('renders every demo section', async ({ page }) => {
  for (const { heading } of SECTIONS) {
    await expect(page.getByRole('heading', { name: heading })).toBeVisible()
  }
})

for (const { name, heading } of SECTIONS) {
  test.describe(name, () => {
    test('shows all items and no indicator when wide', async ({ page }) => {
      const demo = getSection(page, heading)

      await setRange(demo.slider, 800)

      await expect(demo.rest).toHaveCount(0)
      expect(await demo.items.count()).toBeGreaterThan(0)
    })

    test('hides items and shows a +N indicator when narrow', async ({
      page,
    }) => {
      const demo = getSection(page, heading)

      await setRange(demo.slider, 120)

      await expect(demo.rest).toBeVisible()
      await expect(demo.rest).toHaveText(/^\+\d+$/)
    })

    test('recomputes when the container width changes both ways', async ({
      page,
    }) => {
      const demo = getSection(page, heading)

      await setRange(demo.slider, 800)
      await expect(demo.rest).toHaveCount(0)
      const wideCount = await demo.items.count()

      await setRange(demo.slider, 120)
      await expect(demo.rest).toBeVisible()
      expect(await demo.items.count()).toBeLessThan(wideCount)

      await setRange(demo.slider, 800)
      await expect(demo.rest).toHaveCount(0)
      await expect(demo.items).toHaveCount(wideCount)
    })

    test('adds and removes items', async ({ page }) => {
      const demo = getSection(page, heading)
      await setRange(demo.slider, 800)
      await expect(demo.rest).toHaveCount(0)

      const before = await demo.items.count()

      await demo.textInput.fill('E2ETAG')
      await demo.addButton.click()

      await expect(demo.items.filter({ hasText: 'E2ETAG' })).toHaveCount(1)
      await expect(demo.items).toHaveCount(before + 1)

      // Clicking an item removes it.
      await demo.items.filter({ hasText: 'E2ETAG' }).click()
      await expect(demo.items.filter({ hasText: 'E2ETAG' })).toHaveCount(0)
      await expect(demo.items).toHaveCount(before)
    })
  })
}
