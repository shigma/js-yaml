'use strict'

const { it } = require('node:test')

const assert = require('assert')
const yaml = require('js-yaml')

it('Block scalar chomping does not work on zero indent', function () {
  const dumped = yaml.dump('foo\nbar')

  assert.strictEqual(dumped, '|-\n  foo\n  bar\n')
  assert.strictEqual(yaml.load(dumped), 'foo\nbar')
})
