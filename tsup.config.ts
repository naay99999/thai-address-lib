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
    external: ['react', 'react-dom'],
    treeshake: true,
  },
  // Data entry: compact raw data + async loader (replaces pre-built defaultIndex)
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
