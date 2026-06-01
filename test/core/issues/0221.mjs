import { it } from 'node:test'

import assert from 'node:assert'
import { dump, load } from 'js-yaml'

it('Block scalar chomping does not work on zero indent', function () {
  const dumped = dump('foo\nbar')

  assert.strictEqual(dumped, '|-\n  foo\n  bar\n')
  assert.strictEqual(load(dumped), 'foo\nbar')
})
