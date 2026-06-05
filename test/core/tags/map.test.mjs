import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { load } from 'js-yaml'

describe('tags', () => {
  it('map', () => {
    const src = `
Block style: !!map
  Clark : Evans
  Brian : Ingerson
  Oren  : Ben-Kiki
Flow style: !!map { Clark: Evans, Brian: Ingerson, Oren: Ben-Kiki }

? - foo
  - bar
: baz
`
    const expected = {
      'Block style': {
        Clark: 'Evans',
        Brian: 'Ingerson',
        Oren: 'Ben-Kiki'
      },
      'Flow style': {
        Clark: 'Evans',
        Brian: 'Ingerson',
        Oren: 'Ben-Kiki'
      },
      'foo,bar': 'baz'
    }

    assert.deepStrictEqual(load(src), expected)
  })
})
