import { describe, it } from 'node:test'

import assert from 'node:assert'
import { CORE_SCHEMA, dump, load, defineScalarTag } from 'js-yaml'

describe('Custom tags', () => {
  const tagNames = ['tag', '!tag', '!!tag', '!<!tag>', 'tag*-!< >{\n}', '!tagαβγ']
  const encoded = ['!<tag>', '!tag', '!%21tag', '!%3C%21tag%3E',
    '!<tag*-%21%3C%20%3E%7B%0A%7D>', '!tag%CE%B1%CE%B2%CE%B3']

  const tags = tagNames.map(tag =>
    defineScalarTag(tag, {
      nodeKind: 'scalar',
      resolve: () => true,
      construct: object => [tag, object],
      predicate: object => object.tag === tag,
      represent: () => 'value'
    })
  )

  const schema = CORE_SCHEMA.withTags(tags)

  it('Should dump tags with proper encoding', () => {
    tagNames.forEach((tag, idx) => {
      assert.strictEqual(dump({ tag }, { schema }), `${encoded[idx]} value\n`)
    })
  })

  it('Should decode tags when loading', () => {
    encoded.forEach((tag, idx) => {
      assert.deepStrictEqual(load(`${tag} value`, { schema }), [tagNames[idx], 'value'])
    })
  })

  it('Should url-decode built-in tags', () => {
    assert.strictEqual(load('!!%69nt 123'), 123)
    assert.strictEqual(load('!!%73tr 123'), '123')
  })

  it('Should url-decode %TAG prefix', () => {
    assert.deepStrictEqual(load(`
%TAG !xx! %74a
---
!xx!g 123
`, { schema }), ['tag', '123'])
  })

  it('Should allow digits in named tag handles', () => {
    assert.deepStrictEqual(load(`
%TAG !1! tag:yaml.org,2002:
%TAG !a1-2! tag:yaml.org,2002:
---
k1: !1!str some-string
k2: !a1-2!str 123
`), {
      k1: 'some-string',
      k2: '123'
    })
  })
})
