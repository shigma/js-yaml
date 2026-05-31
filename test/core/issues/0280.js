'use strict'

const { it } = require('node:test')

const assert = require('assert')
const yaml = require('js-yaml')

it('Loader must throw an error on zero-indentation block scalar', function () {
  assert.throws(() => yaml.load('--- |\nfoo\n'), /missing indentation for block scalar/)
  assert.throws(() => yaml.load('|-\nfoo\nbar'), /missing indentation for block scalar/)
  assert.throws(() => yaml.load('>\nfoo\nbar'), /missing indentation for block scalar/)

  assert.strictEqual(yaml.load('|-\n foo\n bar'), 'foo\nbar')
  assert.deepStrictEqual(yaml.load('a: |-\n  foo\n  bar'), { a: 'foo\nbar' })
  assert.deepStrictEqual(yaml.load('- |-\n  foo\n  bar'), ['foo\nbar'])
})
