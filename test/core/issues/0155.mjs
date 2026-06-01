import { it } from 'node:test'

import assert from 'node:assert'
import { load } from 'js-yaml'

it('Named null', () => {
  assert.deepStrictEqual(load('---\ntest: !!null \nfoo: bar'), { test: null, foo: 'bar' })
})
