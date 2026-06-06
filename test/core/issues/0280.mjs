import { it } from 'node:test'

import assert from 'node:assert'
import { load } from 'js-yaml'

it.skip('Loader must throw an error on zero-indentation block scalar', () => {
  // See https://github.com/nodeca/js-yaml/issues/280
  // This conflists with W4TN, M7A3, DWX9 of yaml 1.2 test suite.

  assert.throws(() => load('--- |\nfoo\n'), /missing indentation for block scalar/)
  assert.throws(() => load('|-\nfoo\nbar'), /missing indentation for block scalar/)
  assert.throws(() => load('>\nfoo\nbar'), /missing indentation for block scalar/)

  assert.strictEqual(load('|-\n foo\n bar'), 'foo\nbar')
  assert.deepStrictEqual(load('a: |-\n  foo\n  bar'), { a: 'foo\nbar' })
  assert.deepStrictEqual(load('- |-\n  foo\n  bar'), ['foo\nbar'])
})
