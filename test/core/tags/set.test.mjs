import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { dump, load, YAML11_SCHEMA } from 'js-yaml'

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
      'baseball players': new Set(['Mark McGwire', 'Sammy Sosa', 'Ken Griffey']),
      'baseball teams': new Set(['Boston Red Sox', 'Detroit Tigers', 'New York Yankees'])
    }

    assert.deepStrictEqual(load(src, { schema: YAML11_SCHEMA }), expected)
  })

  it('set round-trip', () => {
    const source = new Set(['Boston Red Sox', 'Detroit Tigers', 'New York Yankees'])
    const dumped = dump(source, { schema: YAML11_SCHEMA })
    const result = load(dumped, { schema: YAML11_SCHEMA })

    assert.match(dumped, /^!!set/)
    assert.ok(result instanceof Set)
    assert.deepStrictEqual(result, source)
  })

  it('set throws on an item with a non-null value', () => {
    const src = `
--- !!set
? key
: not null
`
    assert.throws(() => load(src, { schema: YAML11_SCHEMA }), /cannot resolve a set item/)
  })

  it('merges set entries as null-valued mapping keys', () => {
    const src = `
existing: value
<<: !!set { baseball, soccer }
`
    assert.deepStrictEqual(load(src, { schema: YAML11_SCHEMA }), {
      baseball: null,
      soccer: null,
      existing: 'value'
    })
  })

  it('Resolving explicit !!set on empty node', () => {
    assert.deepStrictEqual(load('!!set', { schema: YAML11_SCHEMA }), new Set())
  })
})
