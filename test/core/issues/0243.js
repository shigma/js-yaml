'use strict'

const { describe, it } = require('node:test')

const assert = require('assert')
const yaml = require('js-yaml')
const readFileSync = require('fs').readFileSync

describe('Duplicated mapping key errors throw at beginning of key', function () {
  it('on top level', function () {
    const src = readFileSync(require('path').join(__dirname, '/0243-basic.yml'), 'utf8')
    const lines = src.split('\n')

    try {
      yaml.load(src)
    } catch (e) {
      assert.strictEqual(lines[e.mark.line], 'duplicate: # 2')
      assert.strictEqual(e.mark.line, 9)
      assert.strictEqual(e.mark.column, 0)
    }
  })

  it('inside of mapping values', function () {
    const src = readFileSync(require('path').join(__dirname, '/0243-nested.yml'), 'utf8')
    const lines = src.split('\n')

    try {
      yaml.load(src)
    } catch (e) {
      assert.strictEqual(lines[e.mark.line], '  duplicate: # 2')
      assert.strictEqual(e.mark.line, 9)
      assert.strictEqual(e.mark.column, 2)
    }
  })

  it('inside flow collection', function () {
    try {
      yaml.load('{ foo: 123, foo: 456 }')
    } catch (e) {
      assert.strictEqual(e.mark.line, 0)
      assert.strictEqual(e.mark.column, 12)
    }
  })

  it('inside a set', function () {
    try {
      yaml.load('   ? foo\n   ? foo\n   ? bar')
    } catch (e) {
      assert.strictEqual(e.mark.line, 1)
      assert.strictEqual(e.mark.column, 4)
    }
  })
})
