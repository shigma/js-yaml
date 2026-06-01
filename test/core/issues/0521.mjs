import { it } from 'node:test'

import assert from 'node:assert'
import { dump } from 'js-yaml'

it('Don\'t quote strings with # without need', () => {
  const required = `
http://example.com/page#anchor: no:quotes#required
parameter#fallback: 'quotes #required'
'quotes: required': Visit [link](http://example.com/foo#bar)
'foo #bar': key is quoted
`.replace(/^\n/, '')

  const sample = {
    'http://example.com/page#anchor': 'no:quotes#required',
    'parameter#fallback': 'quotes #required',
    'quotes: required': 'Visit [link](http://example.com/foo#bar)',
    'foo #bar': 'key is quoted'
  }

  assert.strictEqual(
    dump(sample),
    required
  )
})

it('Quote []{} in block-level scalars, but not in flow', () => {
  const required = `
key1: a[]b
key2: a{}b
nested:
  key1: a[]b
  key2: a{}b
  nested: {key1: 'a[]b', key2: 'a{}b', nested: {key1: 'a[]b', key2: 'a{}b'}}
`.replace(/^\n/, '')

  const sample = {
    key1: 'a[]b',
    key2: 'a{}b',
    nested: {
      key1: 'a[]b',
      key2: 'a{}b',
      nested: {
        key1: 'a[]b',
        key2: 'a{}b',
        nested: {
          key1: 'a[]b',
          key2: 'a{}b'
        }
      }
    }
  }

  assert.strictEqual(
    dump(sample, { flowLevel: 2 }),
    required
  )
})
