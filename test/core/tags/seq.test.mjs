import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { load, YAML11_SCHEMA } from 'js-yaml'

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
  })
})
