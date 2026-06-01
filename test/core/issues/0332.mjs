import { it } from 'node:test'

import assert from 'node:assert'
import { load } from 'js-yaml'

it('Should format errors', () => {
  try {
    load('"foo\u0001bar"')
  } catch (err) {
    assert.strictEqual(err.toString(true), 'YAMLException: expected valid JSON character (1:9)')
    assert.strictEqual(err.toString(false), `YAMLException: expected valid JSON character (1:9)

 1 | "foo\u0001bar"
-------------^`)
  }

  try {
    load('*')
  } catch (err) {
    assert.strictEqual(err.toString(), `YAMLException: name of an alias node must contain at least one character (1:2)

 1 | *
------^`)
  }

  try {
    load('foo:\n  bar: 1\na')
  } catch (err) {
    assert.strictEqual(err.toString(), `YAMLException: can not read a block mapping entry; a multiline key may not be an implicit key (4:1)

 1 | foo:
 2 |   bar: 1
 3 | a
 4 | 
-----^`)
  }
})
