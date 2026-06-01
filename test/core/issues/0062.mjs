import { it } from 'node:test'

import assert from 'node:assert'
import { load } from 'js-yaml'

it('should not steal a property from the first block mapping key', function () {
  assert.deepStrictEqual(
    load(`
obj:
  !!str foo: bar
  baz: 1
`),
    { obj: { foo: 'bar', baz: 1 } }
  )

  // Same defect at the top level (surfaces as "end of the stream ..." instead
  // of "bad indentation", but it's the same fix).
  assert.deepStrictEqual(
    load('!!str 16: 32'),
    { 16: 32 }
  )

  // Tag on the mapping AND on its first key: `!!map` must go to the mapping and
  // `!!str` to the key, not collide as "duplication of a tag property".
  assert.deepStrictEqual(
    load(`
block mapping: !!map
  !!str implicit key: some value
`),
    { 'block mapping': { 'implicit key': 'some value' } }
  )

  // Same ambiguity with anchors: `&anchor` belongs to the key `foo`, so the
  // alias key below resolves to the string "foo". The space before `:` matters,
  // otherwise `anchor:` is parsed as the alias name.
  assert.deepStrictEqual(
    load(`
&anchor foo:
  *anchor : bar
`),
    { foo: { foo: 'bar' } }
  )
})
