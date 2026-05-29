#!/usr/bin/env node

import { build } from 'vite'
import { viteSingleFile } from 'vite-plugin-singlefile'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

await build({
  root: 'support/demo_template',
  configFile: false,
  plugins: [
    nodePolyfills({ include: ['util'] }),
    viteSingleFile({ removeViteModuleLoader: true })
  ],
  build: {
    outDir: '../../demo',
    emptyOutDir: true
  }
})
