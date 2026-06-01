import { rm } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { build } from 'vite'

const require = createRequire(import.meta.url)
const pkg = require('../package.json')

const banner = `/*! ${pkg.name} ${pkg.version} https://github.com/${pkg.repository} @license ${pkg.license} */`

const common = {
  configFile: false,
  logLevel: 'info',
  build: {
    outDir: 'dist',
    emptyOutDir: false,
    sourcemap: true,
    target: 'es2015'
  }
}

await rm('dist', { recursive: true, force: true })

await build({
  ...common,
  build: {
    ...common.build,
    minify: false,
    lib: {
      entry: 'src/index.ts',
      formats: ['cjs'],
      fileName: () => 'js-yaml.cjs.js'
    },
    rollupOptions: {
      external: [],
      output: {
        banner,
        exports: 'named'
      }
    }
  }
})

await build({
  ...common,
  build: {
    ...common.build,
    minify: false,
    lib: {
      entry: 'src/index.ts',
      formats: ['es'],
      fileName: () => 'js-yaml.mjs'
    },
    rollupOptions: {
      external: [],
      output: {
        banner
      }
    }
  }
})

await build({
  ...common,
  build: {
    ...common.build,
    outDir: 'dist/browser',
    minify: true,
    lib: {
      entry: 'src/index.ts',
      name: 'jsyaml',
      formats: ['umd'],
      fileName: () => 'js-yaml.umd.min.js'
    },
    rollupOptions: {
      external: [],
      output: {
        banner,
        exports: 'named',
        name: 'jsyaml'
      }
    }
  }
})

await build({
  ...common,
  build: {
    ...common.build,
    outDir: 'dist/browser',
    minify: true,
    lib: {
      entry: 'src/index.ts',
      formats: ['es'],
      fileName: () => 'js-yaml.esm.min.mjs'
    },
    rollupOptions: {
      external: [],
      output: {
        banner
      }
    }
  }
})
