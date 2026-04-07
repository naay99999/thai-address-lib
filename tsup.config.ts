import { defineConfig } from 'tsup'

export default defineConfig([
  // Core entry: all logic without pre-built dataset
  {
    entry: { index: 'src/index.ts' },
    format: ['esm', 'cjs'],
    dts: true,
    splitting: false,
    sourcemap: true,
    clean: true,
    external: ['react', 'react-dom', './data/defaultIndex'],
    treeshake: true,
  },
  // Data entry: pre-built defaultIndex (optional, large)
  {
    entry: { data: 'src/data/index.ts' },
    format: ['esm', 'cjs'],
    dts: true,
    splitting: false,
    sourcemap: false,
    external: [],
    treeshake: true,
  },
])
