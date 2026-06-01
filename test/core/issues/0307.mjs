import { it } from 'node:test'

import assert from 'node:assert'
import { load } from 'js-yaml'

it('Trims trailing whitespace when folding flow scalar lines', () => {
  // https://github.com/nodeca/js-yaml/issues/307
  // https://yaml.org/spec/1.2.0/#id2787745
  assert.strictEqual(
    load('"folded \nto a space,\t\n \nto a line feed, or \t\\\n \\ \tnon-content"'),
    'folded to a space,\nto a line feed, or \t \tnon-content'
  )

  assert.strictEqual(
    load("'folded \nto a space,\t\n \nto a line feed'"),
    'folded to a space,\nto a line feed'
  )
})

it('Preserves trailing whitespace in the final line of quoted scalars', () => {
  assert.strictEqual(load('"line \t"'), 'line \t')
  assert.strictEqual(load("'line \t'"), 'line \t')
})
