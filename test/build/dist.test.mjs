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
  'NODE_KIND_MAPPING',
  'NODE_KIND_SCALAR',
  'NODE_KIND_SEQUENCE',
  'NODE_KIND_UNKNOWN',
  'Schema',
  'Type',
  'YAMLException',
  'dump',
  'load',
  'loadAll',
  'nodeKindToString',
  'types'
]

function checkExports (yaml, options) {
  assert.deepStrictEqual(Object.keys(yaml).sort(), expectedKeys.slice().sort())
  assert.strictEqual(yaml.load('a: 1').a, 1)
  assert.strictEqual(typeof yaml.dump, 'function')
  assert.strictEqual(typeof yaml.types.binary, 'object')
  assert.strictEqual(yaml.NODE_KIND_UNKNOWN, 0)
  assert.strictEqual(yaml.NODE_KIND_SCALAR, 1)
  assert.strictEqual(yaml.NODE_KIND_SEQUENCE, 2)
  assert.strictEqual(yaml.NODE_KIND_MAPPING, 3)
  assert.strictEqual(yaml.nodeKindToString(yaml.NODE_KIND_UNKNOWN), 'unknown')
  assert.strictEqual(yaml.nodeKindToString(yaml.NODE_KIND_SCALAR), 'scalar')
  assert.strictEqual(yaml.nodeKindToString(yaml.NODE_KIND_SEQUENCE), 'sequence')
  assert.strictEqual(yaml.nodeKindToString(yaml.NODE_KIND_MAPPING), 'mapping')

  if (options && options.checkEsModule) {
    assert.strictEqual(yaml.__esModule, true)
  }
}

function loadGlobal (filename) {
  const context = {}

  vm.runInNewContext(fs.readFileSync(path.join(distDir, filename), 'utf8'), context)

  return context.jsyaml
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

  it('exposes the expected browser global from js-yaml.umd.min.js', () => {
    checkExports(loadGlobal('browser/js-yaml.umd.min.js'))
  })
})
