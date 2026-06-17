import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { load, dump, YAML11_SCHEMA } from 'js-yaml'

describe('tags', () => {
  it('seq', () => {
    const src = `
Block style: !!seq
- Mercury
- Venus
- Earth
- Mars
- Jupiter
- Saturn
- Uranus
- Neptune
- Pluto
Flow style: !!seq [ Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune, Pluto ]
`
    const expected = {
      'Block style': ['Mercury', 'Venus', 'Earth', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'],
      'Flow style': ['Mercury', 'Venus', 'Earth', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto']
    }

    assert.deepStrictEqual(load(src, { schema: YAML11_SCHEMA }), expected)
    assert.deepStrictEqual(load(dump(expected, { schema: YAML11_SCHEMA }), { schema: YAML11_SCHEMA }), expected)
  })

  it('Resolving explicit !!seq on empty node', () => {
    assert.deepStrictEqual(load('!!seq'), [])
  })

  it('throws on a non-empty scalar with explicit !!seq', () => {
    assert.throws(() => load('!!seq foo'), /cannot resolve a node with !<tag:yaml\.org,2002:seq> explicit tag/)
  })
})
