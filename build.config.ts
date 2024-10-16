import { defineBuildConfig } from 'unbuild'
import sharedConfig from './shared.config'

export default defineBuildConfig({
  entries: [
    // normal bundles
    'src/sources/dynamic.ts',
    'src/sources/object-storage-lite.ts',
  ],
  declaration: 'node16',
  clean: true,
  rollup: {
    esbuild: {
      target: 'esnext',
      // minify: true,
    },
  },
  ...sharedConfig,
})
