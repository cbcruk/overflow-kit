import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    // Unit tests live next to the source; Playwright specs under e2e/ run
    // separately via `pnpm test:e2e`.
    include: ['src/**/*.test.{ts,tsx}'],
  },
})
