import { describe, it } from 'node:test'

import assert from 'node:assert'
import fs from 'node:fs'
import path from 'node:path'
import vm from 'node:vm'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'

const require = createRequire(import.meta.url)
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const distDir = path.resolve(__dirname, '../../dist')

const expectedKeys = [
  'CORE_SCHEMA',
  'DEFAULT_SCHEMA',
  'FAILSAFE_SCHEMA',
  'JSON_SCHEMA',
  'Schema',
  'Type',
  'YAMLException',
  'default',
  'dump',
  'load',
  'loadAll',
  'safeDump',
  'safeLoad',
  'safeLoadAll',
  'types'
]

function checkExports (yaml, options) {
  assert.deepStrictEqual(Object.keys(yaml).sort(), expectedKeys.slice().sort())
  assert.strictEqual(yaml.default.load, yaml.load)
  assert.strictEqual(yaml.load('a: 1').a, 1)
  assert.strictEqual(typeof yaml.dump, 'function')
  assert.strictEqual(typeof yaml.types.binary, 'object')

  if (options && options.checkEsModule) {
    assert.strictEqual(yaml.__esModule, true)
  }
}

function loadGlobal (filename) {
  const context = {}

  vm.runInNewContext(fs.readFileSync(path.join(distDir, filename), 'utf8'), context)

  return context.jsyaml
}

describe('dist build', function () {
  it('keeps Vite proxy exports in sync with the CommonJS entry', async function () {
    const yaml = require('js-yaml')
    const proxy = await import('../../lib/index_vite_proxy.tmp.mjs')

    assert.deepStrictEqual(Object.keys(proxy).sort(), Object.keys(yaml).concat('default').sort())
    assert.strictEqual(proxy.default, yaml)

    Object.keys(yaml).forEach(function (key) {
      assert.strictEqual(proxy[key], yaml[key])
    })
  })

  it('exports the expected UMD API from js-yaml.js', function () {
    checkExports(require('../../dist/js-yaml.js'), { checkEsModule: true })
  })

  it('exports the expected UMD API from js-yaml.min.js', function () {
    checkExports(require('../../dist/js-yaml.min.js'), { checkEsModule: true })
  })

  it('exports the expected ESM API from js-yaml.mjs', async function () {
    checkExports(await import('../../dist/js-yaml.mjs'))
  })

  it('exposes the expected browser global from js-yaml.js', function () {
    checkExports(loadGlobal('js-yaml.js'))
  })

  it('exposes the expected browser global from js-yaml.min.js', function () {
    checkExports(loadGlobal('js-yaml.min.js'))
  })
})
