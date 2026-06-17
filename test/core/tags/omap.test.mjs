import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { load, YAML11_SCHEMA } from 'js-yaml'

describe('tags', () => {
  it('omap', () => {
    const src = `
Bestiary: !!omap
  - aardvark: African pig-like ant eater. Ugly.
  - anteater: South-American ant eater. Two species.
  - anaconda: South-American constrictor snake. Scaly.
Numbers: !!omap [ one: 1, two: 2, three : 3 ]
`
    const expected = {
      Bestiary: [
        { aardvark: 'African pig-like ant eater. Ugly.' },
        { anteater: 'South-American ant eater. Two species.' },
        { anaconda: 'South-American constrictor snake. Scaly.' }
      ],
      Numbers: [
        { one: 1 },
        { two: 2 },
        { three: 3 }
      ]
    }

    assert.deepStrictEqual(load(src, { schema: YAML11_SCHEMA }), expected)
  })

  it('omap throws when not a sequence', () => {
    const src = `
--- !!omap
foo: bar
baz: bat
`
    assert.throws(() => load(src, { schema: YAML11_SCHEMA }), /unknown mapping tag/)
  })

  it('omap throws on a non-mapping item', () => {
    const src = `
--- !!omap
- foo: bar
- baz
`
    assert.throws(() => load(src, { schema: YAML11_SCHEMA }), /cannot resolve an ordered map item/)
  })

  it('omap throws on an item with multiple keys', () => {
    const src = `
--- !!omap
- foo: bar
- baz: bar
  bar: bar
`
    assert.throws(() => load(src, { schema: YAML11_SCHEMA }), /cannot resolve an ordered map item/)
  })

  it('omap throws on duplicated keys', () => {
    const src = `
--- !!omap
- a: 1
- a: 2
`
    assert.throws(() => load(src, { schema: YAML11_SCHEMA }), /cannot resolve an ordered map item/)
  })

  it('Resolving explicit !!omap on empty node', () => {
    assert.deepStrictEqual(load('!!omap', { schema: YAML11_SCHEMA }), [])
  })
})
