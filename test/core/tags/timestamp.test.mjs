import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { load, dump, YAML11_SCHEMA, YAMLException } from 'js-yaml'

describe('tags', () => {
  it('timestamp', () => {
    const src = `
- 2001-12-15T02:59:43.1Z       # canonical
- 2001-12-14t21:59:43.10-05:00 # valid iso8601
- 2001-12-14 21:59:43.10 -5    # space separated
- 2001-12-15 2:59:43.10        # no time zone (Z)
- 2002-12-14                   # date (00:00:00Z)
- 2002-1-1                     # not a date

# Other
- 2001-12-14 21:59:43.10 -5:30
- 2001-12-14 21:59:43.10 +5:30
- 2001-12-14 21:59:43.00101
- 2001-12-14 21:59:43+1
- 2001-12-14 21:59:43-1:30
- 2005-07-08 17:35:04.517600
`
    const expected = [
      new Date(Date.UTC(2001, 11, 15, 2, 59, 43, 100)),
      new Date(Date.UTC(2001, 11, 15, 2, 59, 43, 100)),
      new Date(Date.UTC(2001, 11, 15, 2, 59, 43, 100)),
      new Date(Date.UTC(2001, 11, 15, 2, 59, 43, 100)),
      new Date(Date.UTC(2002, 11, 14)),
      '2002-1-1',

      new Date(Date.UTC(2001, 11, 15, 3, 29, 43, 100)),
      new Date(Date.UTC(2001, 11, 14, 16, 29, 43, 100)),
      new Date(Date.UTC(2001, 11, 14, 21, 59, 43, 1)),
      new Date(Date.UTC(2001, 11, 14, (21 - 1), 59, 43, 0)),
      new Date(Date.UTC(2001, 11, 14, (21 + 1), (59 + 30), 43, 0)),
      new Date(Date.UTC(2005, 6, 8, 17, 35, 4, 517))
    ]

    assert.deepStrictEqual(load(src, { schema: YAML11_SCHEMA }), expected)
    assert.deepStrictEqual(load(dump(expected, { schema: YAML11_SCHEMA }), { schema: YAML11_SCHEMA }), expected)
  })

  it('Resolving explicit !!timestamp on empty node', () => {
    assert.throws(() => { load('!!timestamp', { schema: YAML11_SCHEMA }) }, YAMLException)
  })
})
