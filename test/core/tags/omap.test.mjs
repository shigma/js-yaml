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
})
