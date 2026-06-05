import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { load, YAML11_SCHEMA } from 'js-yaml'

describe('tags', () => {
  it('pairs', () => {
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
})
