'use strict'

const { it } = require('node:test')

const assert = require('assert')
const yaml = require('js-yaml')

it('Should check kind type when resolving !<?> tag', function () {
  try {
    yaml.load('!<?> [0]')
  } catch (err) {
    assert(err.stack.startsWith('YAMLException: unacceptable node kind for !<?> tag'))
    return
  }
  assert.fail(null, null, 'Expected an error to be thrown')
})
