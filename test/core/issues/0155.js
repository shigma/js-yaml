'use strict'

const { it } = require('node:test')

const assert = require('assert')
const yaml = require('js-yaml')

it('Named null', function () {
  assert.deepStrictEqual(yaml.load('---\ntest: !!null \nfoo: bar'), { test: null, foo: 'bar' })
})
