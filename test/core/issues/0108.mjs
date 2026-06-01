import { it } from 'node:test'

import assert from 'node:assert'
import { load } from 'js-yaml'

it('Literal scalars have an unwanted leading line break', function () {
  assert.strictEqual(load('|\n  foobar\n'), 'foobar\n')
  assert.strictEqual(load('|\n  hello\n  world\n'), 'hello\nworld\n')
  assert.strictEqual(load('|\n  war never changes\n'), 'war never changes\n')
})
