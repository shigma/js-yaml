import { describe, it } from 'node:test'

import assert from 'node:assert'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)

function checkExports (yaml, options) {
  assert.strictEqual(yaml.load('a: 1').a, 1)
  assert.strictEqual(yaml.dump({ a: 1 }), 'a: 1\n')

  if (options && options.checkEsModule) {
    assert.strictEqual(yaml.__esModule, true)
  }
}

describe('dist build', () => {
  it('exports the expected CommonJS API from js-yaml.cjs.js', () => {
    const yaml = require('js-yaml')
    checkExports(yaml)
  })

  it('exports the expected ESM API from js-yaml.mjs', async () => {
    checkExports(await import('../../dist/js-yaml.mjs'))
  })

  it('exports the expected browser ESM API from js-yaml.esm.min.mjs', async () => {
    checkExports(await import('../../dist/browser/js-yaml.esm.min.mjs'))
  })

  it('exports the expected browser CommonJS API from js-yaml.umd.min.js', () => {
    checkExports(require('../../dist/browser/js-yaml.umd.min.js'))
  })
})
