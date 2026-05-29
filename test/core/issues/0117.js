'use strict'

const { it } = require('node:test')

const assert = require('assert')
const yaml = require('js-yaml')

it('Negative zero loses the sign after dump', function () {
  assert.strictEqual(yaml.dump(-0), '-0.0\n')
})
