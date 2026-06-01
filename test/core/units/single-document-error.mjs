import { it } from 'node:test'

import assert from 'node:assert'
import { load, YAMLException } from 'js-yaml'

it('Loading multidocument source using `load` should cause an error', function () {
  assert.throws(function () {
    load('--- # first document\n--- # second document\n')
  }, YAMLException)

  assert.throws(function () {
    load('---\nfoo: bar\n---\nfoo: bar\n')
  }, YAMLException)

  assert.throws(function () {
    load('foo: bar\n---\nfoo: bar\n')
  }, YAMLException)
})
