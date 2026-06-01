import { it } from 'node:test'

import assert from 'node:assert'
import { load } from 'js-yaml'

it('BOM strip', () => {
  assert.deepStrictEqual(load('\uFEFFfoo: bar\n'), { foo: 'bar' })
  assert.deepStrictEqual(load('foo: bar\n'), { foo: 'bar' })
})
