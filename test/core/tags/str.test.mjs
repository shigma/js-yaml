import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { load, dump } from 'js-yaml'

describe('tags', () => {
  it('str', () => {
    assert.deepStrictEqual(load('string: abcd'), { string: 'abcd' })
    assert.deepStrictEqual(load(dump({ string: 'abcd' })), { string: 'abcd' })
  })

  it('str unicode', () => {
    const src = '!!str "Это уникодная строка"'
    const expected = 'Это уникодная строка'

    assert.strictEqual(load(src), expected)
  })

  it('bad unicode char', () => {
    const src = '"\udd00"'
    const expected = '\udd00'

    assert.strictEqual(load(src), expected)
  })
})
