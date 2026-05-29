'use strict'

const { it } = require('node:test')

const assert = require('assert')
const yaml = require('js-yaml')

it('Float type dumper should not miss dot', function () {
  assert.strictEqual(5e-100.toString(10), '5e-100')
  assert.strictEqual(0.5e-100.toString(10), '5e-101')

  assert.strictEqual(yaml.dump(0.5e-100), '5.e-101\n')
  assert.strictEqual(yaml.load(yaml.dump(5e-100)), 5e-100)
})
