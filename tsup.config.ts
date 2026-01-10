import { defineConfig } from 'tsup'

export default defineConfig({
  entry: {
    'core/index': 'src/core/index.ts',
    'utils/index': 'src/utils/index.ts',
    'canvas/index': 'src/canvas/index.ts',
    'generator/index': 'src/generator/index.ts',
  },
  format: ['esm'],
  dts: true,
  clean: true,
  splitting: false,
})
