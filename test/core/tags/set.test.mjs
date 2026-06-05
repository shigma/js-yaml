import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { load, YAML11_SCHEMA } from 'js-yaml'

describe('tags', () => {
  it('set', () => {
    const src = `
baseball players: !!set
  ? Mark McGwire
  ? Sammy Sosa
  ? Ken Griffey
baseball teams: !!set { Boston Red Sox, Detroit Tigers, New York Yankees }
`
    const expected = {
      'baseball players': {
        'Mark McGwire': null,
        'Sammy Sosa': null,
        'Ken Griffey': null
      },
      'baseball teams': {
        'Boston Red Sox': null,
        'Detroit Tigers': null,
        'New York Yankees': null
      }
    }

    assert.deepStrictEqual(load(src, { schema: YAML11_SCHEMA }), expected)
  })
})
