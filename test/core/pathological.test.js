'use strict'

const { describe, it } = require('node:test')
const assert = require('assert')
const yaml = require('js-yaml')

function assertYamlException (fn, pattern) {
  try {
    fn()
  } catch (error) {
    assert(
      error instanceof yaml.YAMLException,
      `expected YAMLException, got ${error.name}`
    )
    if (pattern) assert.match(error.message, pattern)
    return
  }

  assert.fail('expected YAMLException')
}

describe('Pathological tests', function () {
  describe('Deep nesting', function () {
    it('throws YAMLException on deep array nesting (not stack overflow error)', function () {
      assertYamlException(function () { yaml.load('['.repeat(100000)) },
        /nesting exceeded maxDepth/)
    })

    it('throws YAMLException on deep object nesting (not stack overflow error)', function () {
      assertYamlException(function () { yaml.load('{a: '.repeat(100000)) },
        /nesting exceeded maxDepth/)
    })
  })
})
