'use strict'

const { it } = require('node:test')

const assert = require('assert')
const yaml = require('js-yaml')

it('Trims trailing whitespace when folding flow scalar lines', function () {
  // https://github.com/nodeca/js-yaml/issues/307
  // https://yaml.org/spec/1.2.0/#id2787745
  assert.strictEqual(
    yaml.load('"folded \nto a space,\t\n \nto a line feed, or \t\\\n \\ \tnon-content"'),
    'folded to a space,\nto a line feed, or \t \tnon-content'
  )

  assert.strictEqual(
    yaml.load("'folded \nto a space,\t\n \nto a line feed'"),
    'folded to a space,\nto a line feed'
  )
})

it('Preserves trailing whitespace in the final line of quoted scalars', function () {
  assert.strictEqual(yaml.load('"line \t"'), 'line \t')
  assert.strictEqual(yaml.load("'line \t'"), 'line \t')
})
