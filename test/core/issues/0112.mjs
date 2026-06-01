import { it } from 'node:test'

import assert from 'node:assert'
import { load } from 'js-yaml'

it('Plain scalar "constructor" parsed as `null`', function () {
  assert.strictEqual(load('constructor'), 'constructor')
  assert.deepStrictEqual(load('constructor: value'), { constructor: 'value' })
  assert.deepStrictEqual(load('key: constructor'), { key: 'constructor' })
  assert.deepStrictEqual(load('{ constructor: value }'), { constructor: 'value' })
  assert.deepStrictEqual(load('{ key: constructor }'), { key: 'constructor' })
})
