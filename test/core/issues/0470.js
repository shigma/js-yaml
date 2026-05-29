'use strict'

const { it } = require('node:test')

const assert = require('assert')
const yaml = require('js-yaml')

it('Don\'t quote strings with : without need', function () {
  const data = {
    // no quotes needed
    'http://example.com': 'http://example.com',
    // quotes required
    'foo: bar': 'foo: bar',
    'foo:': 'foo:'
  }

  const expected = `
http://example.com: http://example.com
'foo: bar': 'foo: bar'
'foo:': 'foo:'
`.replace(/^\n/, '')

  assert.strictEqual(yaml.dump(data), expected)
  assert.deepStrictEqual(yaml.load(expected), data)
})
