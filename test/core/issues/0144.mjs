import { it } from 'node:test'

import assert from 'node:assert'
import { load } from 'js-yaml'

it('Infinite loop when attempting to parse multi-line scalar document that is not indented', function () {
  assert.throws(() => load('--- |\nfoo\n'), /missing indentation for block scalar/)
})
