'use strict'

const { it } = require('node:test')

const assert = require('assert')
const yaml = require('js-yaml')

it('should not steal a property from the first block mapping key', function () {
  assert.deepStrictEqual(
    yaml.load(`
obj:
  !!str foo: bar
  baz: 1
`),
    { obj: { foo: 'bar', baz: 1 } }
  )

  // Same defect at the top level (surfaces as "end of the stream ..." instead
  // of "bad indentation", but it's the same fix).
  assert.deepStrictEqual(
    yaml.load('!!str 16: 32'),
    { 16: 32 }
  )

  // Tag on the mapping AND on its first key: `!!map` must go to the mapping and
  // `!!str` to the key, not collide as "duplication of a tag property".
  assert.deepStrictEqual(
    yaml.load(`
block mapping: !!map
  !!str implicit key: some value
`),
    { 'block mapping': { 'implicit key': 'some value' } }
  )

  // Same ambiguity with anchors: `&anchor` belongs to the key `foo`, so the
  // alias key below resolves to the string "foo". The space before `:` matters,
  // otherwise `anchor:` is parsed as the alias name.
  assert.deepStrictEqual(
    yaml.load(`
&anchor foo:
  *anchor : bar
`),
    { foo: { foo: 'bar' } }
  )
})
