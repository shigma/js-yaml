'use strict'

const { it } = require('node:test')

const assert = require('assert')
const yaml = require('js-yaml')

it('Don\'t quote strings with # without need', function () {
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
    yaml.dump(sample),
    required
  )
})

it('Quote []{} in block-level scalars, but not in flow', function () {
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
    yaml.dump(sample, { flowLevel: 2 }),
    required
  )
})
