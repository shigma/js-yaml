'use strict'

const { it } = require('node:test')

const assert = require('assert')
const yaml = require('js-yaml')

it('BOM strip', function () {
  assert.deepStrictEqual(yaml.load('\uFEFFfoo: bar\n'), { foo: 'bar' })
  assert.deepStrictEqual(yaml.load('foo: bar\n'), { foo: 'bar' })
})
