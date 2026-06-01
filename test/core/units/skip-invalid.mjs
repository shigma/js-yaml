import { it } from 'node:test'

import assert from 'node:assert'
import { dump, load, YAMLException } from 'js-yaml'

const sample = {
  number: 42,
  string: 'hello',
  func: (a, b) => { return a + b },
  regexp: /^hel+o/,
  array: [1, 2, 3]
}

const expected = {
  number: 42,
  string: 'hello',
  array: [1, 2, 3]
}

it('Dumper must throw an exception on invalid type when option `skipInvalid` is false.', () => {
  assert.throws(() => {
    dump(sample, { skipInvalid: false })
  }, YAMLException)
})

it('Dumper must skip pairs and values with invalid types when option `skipInvalid` is true.', () => {
  assert.deepStrictEqual(load(dump(sample, { skipInvalid: true })), expected)
})
