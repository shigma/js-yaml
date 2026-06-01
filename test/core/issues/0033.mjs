import { it } from 'node:test'

import assert from 'node:assert'
import { load } from 'js-yaml'

it('refactor compact variant of MarkedYAMLError.toString', () => {
  const source = `
foo: {bar} baz
`

  assert.throws(() => {
    load(source)
  }, "require('issue-33.yml') should throw, but it does not")
})
