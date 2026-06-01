import { it } from 'node:test'

import assert from 'node:assert'
import { load, YAMLException } from 'js-yaml'

it('Loading multidocument source using `load` should cause an error', () => {
  assert.throws(() => {
    load('--- # first document\n--- # second document\n')
  }, YAMLException)

  assert.throws(() => {
    load('---\nfoo: bar\n---\nfoo: bar\n')
  }, YAMLException)

  assert.throws(() => {
    load('foo: bar\n---\nfoo: bar\n')
  }, YAMLException)
})
