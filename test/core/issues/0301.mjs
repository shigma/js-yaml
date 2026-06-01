import { it } from 'node:test'

import assert from 'node:assert'
import { load } from 'js-yaml'

it('should assign anchor to an empty node', function () {
  assert.deepStrictEqual(
    load('foo: &a\nbar: *a\n'),
    { foo: null, bar: null }
  )

  assert.deepStrictEqual(
    load('{ foo: &a, bar: *a }'),
    { foo: null, bar: null }
  )

  assert.deepStrictEqual(
    load('- &a\n- *a\n'),
    [null, null]
  )

  assert.deepStrictEqual(
    load('[ &a, *a ]'),
    [null, null]
  )
})
