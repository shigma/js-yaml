import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { load, YAML11_SCHEMA } from 'js-yaml'

describe('tags', () => {
  it('timestamp', () => {
    const src = `
canonical:        2001-12-15T02:59:43.1Z
valid iso8601:    2001-12-14t21:59:43.10-05:00
space separated:  2001-12-14 21:59:43.10 -5
no time zone (Z): 2001-12-15 2:59:43.10
date (00:00:00Z): 2002-12-14
not a date:       2002-1-1
`
    const expected = {
      canonical: new Date(Date.UTC(2001, 11, 15, 2, 59, 43, 100)),
      'valid iso8601': new Date(Date.UTC(2001, 11, 15, 2, 59, 43, 100)),
      'space separated': new Date(Date.UTC(2001, 11, 15, 2, 59, 43, 100)),
      'no time zone (Z)': new Date(Date.UTC(2001, 11, 15, 2, 59, 43, 100)),
      'date (00:00:00Z)': new Date(Date.UTC(2002, 11, 14)),
      'not a date': '2002-1-1'
    }

    assert.deepStrictEqual(load(src, { schema: YAML11_SCHEMA }), expected)
  })
})
