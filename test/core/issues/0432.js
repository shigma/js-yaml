'use strict'

const { it } = require('node:test')

const assert = require('assert')
const yaml = require('js-yaml')

it('should indent arrays an extra level by default', function () {
  const output = yaml.dump({ array: ['a', 'b'] })
  const expected = 'array:\n  - a\n  - b\n'
  assert.strictEqual(output, expected)
})

it('should not indent arrays an extra level when disabled', function () {
  const output = yaml.dump({ array: ['a', 'b'] }, { noArrayIndent: true })
  const expected = 'array:\n- a\n- b\n'
  assert.strictEqual(output, expected)
})

it('should always indent nested arrays', function () {
  const output = yaml.dump({ array: ['a', ['b', 'c'], 'd'] }, { noArrayIndent: true })
  const expected = 'array:\n- a\n- - b\n  - c\n- d\n'
  assert.strictEqual(output, expected)
})
