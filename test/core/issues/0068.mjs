import { it } from 'node:test'

import assert from 'node:assert'
import { dump } from 'js-yaml'

it('Prevent adding unnecessary space character to end of a line within block collections', () => {
  assert.strictEqual(dump({ data: ['foo', 'bar', 'baz'] }), 'data:\n  - foo\n  - bar\n  - baz\n')
  assert.strictEqual(dump({ foo: { bar: ['baz'] } }), 'foo:\n  bar:\n    - baz\n')
})
