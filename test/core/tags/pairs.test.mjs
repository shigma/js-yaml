import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { load, realMapTag, YAML11_SCHEMA } from 'js-yaml'

describe('tags/pair', () => {
  it('common', () => {
    const src = `
Block tasks: !!pairs
  - meeting: with team.
  - meeting: with boss.
  - break: lunch.
  - meeting: with client.
Flow tasks: !!pairs [ meeting: with team, meeting: with boss ]
`
    const expected = {
      'Block tasks': [
        ['meeting', 'with team.'],
        ['meeting', 'with boss.'],
        ['break', 'lunch.'],
        ['meeting', 'with client.']
      ],
      'Flow tasks': [
        ['meeting', 'with team'],
        ['meeting', 'with boss']
      ]
    }

    assert.deepStrictEqual(load(src, { schema: YAML11_SCHEMA }), expected)
  })

  it('pairs throws when not a sequence', () => {
    const src = `
--- !!pairs
foo: bar
baz: bat
`
    assert.throws(() => load(src, { schema: YAML11_SCHEMA }), /unknown mapping tag/)
  })

  it('pairs throws on a non-mapping item', () => {
    const src = `
--- !!pairs
- foo: bar
- baz
`
    assert.throws(() => load(src, { schema: YAML11_SCHEMA }), /cannot resolve a pairs item/)
  })

  it('pairs throws on an item with multiple keys', () => {
    const src = `
--- !!pairs
- foo: bar
- baz: bar
  bar: bar
`
    assert.throws(() => load(src, { schema: YAML11_SCHEMA }), /cannot resolve a pairs item/)
  })

  it('supports scalar keys with realMapTag', () => {
    const schema = YAML11_SCHEMA.withTags(realMapTag)
    const result = load('!!pairs [ foo: bar ]', { schema })

    assert.deepStrictEqual(result, [['foo', 'bar']])
  })

  it('rejects complex keys without realMapTag', () => {
    assert.throws(
      () => load('!!pairs [ ? [ foo, bar ] : baz ]', { schema: YAML11_SCHEMA }),
      /object-based map does not support complex keys/
    )
  })

  it('preserves complex keys with realMapTag', () => {
    const schema = YAML11_SCHEMA.withTags(realMapTag)
    const result = load('!!pairs [ ? [ foo, bar ] : baz ]', { schema })

    assert.deepStrictEqual(result, [[['foo', 'bar'], 'baz']])
  })

  it('Resolving explicit !!pairs on empty node', () => {
    assert.deepStrictEqual(load('!!pairs', { schema: YAML11_SCHEMA }), [])
  })
})
