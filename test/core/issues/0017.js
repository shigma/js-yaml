'use strict'

const { it } = require('node:test')

const assert = require('assert')
const yaml = require('js-yaml')

it('Non-specific "!" tags should resolve to !!str', function () {
  const data = yaml.load(`
! 12
`)

  assert.strictEqual(typeof data, 'string')
})
