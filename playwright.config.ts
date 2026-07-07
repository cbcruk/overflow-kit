import { existsSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { defineConfig, devices } from '@playwright/test'

const PORT = 4173
const BASE_URL = `http://localhost:${PORT}`

/**
 * Prefer a pre-installed Chromium (e.g. a sandbox at /opt/pw-browsers) whose
 * revision may not match this Playwright version. Returns undefined when none
 * is found so Playwright resolves its own browser (e.g. in CI).
 */
function findLocalChrome(): string | undefined {
  const base = process.env.PLAYWRIGHT_BROWSERS_PATH
  if (!base || !existsSync(base)) return undefined

  for (const dir of readdirSync(base)) {
    if (!dir.startsWith('chromium-')) continue
    const binary = join(base, dir, 'chrome-linux', 'chrome')
    if (existsSync(binary)) return binary
  }
  return undefined
}

const localChrome = findLocalChrome()

/**
 * E2E config: builds the library and the demo, serves the demo with `vite
 * preview`, and drives it in a real browser so canvas measurement and DOM
 * layout are exercised for real (unlike the happy-dom unit tests).
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [['github'], ['list']] : 'list',
  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        ...(localChrome
          ? { launchOptions: { executablePath: localChrome } }
          : {}),
      },
    },
  ],
  webServer: {
    command: `pnpm build && pnpm --filter @overflow-kit/demo build && pnpm --filter @overflow-kit/demo preview --port ${PORT} --strictPort`,
    url: `${BASE_URL}/overflow-kit/`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
})
