import { describe, it } from 'node:test'

import assert from 'node:assert'
import { load, loadAll } from 'js-yaml'

describe('loader parameters', () => {
  const testStr = 'test: 1 \ntest: 2'
  const expected = [{ test: 2 }]
  let result

  it('loadAll(input, options)', () => {
    result = loadAll(testStr, { json: true })
    assert.deepStrictEqual(result, expected)

    result = []
    loadAll(testStr, (doc) => {
      result.push(doc)
    }, { json: true })
    assert.deepStrictEqual(result, expected)
  })

  it('loadAll(input, null, options)', () => {
    result = loadAll(testStr, null, { json: true })
    assert.deepStrictEqual(result, expected)

    result = []
    loadAll(testStr, (doc) => {
      result.push(doc)
    }, { json: true })
    assert.deepStrictEqual(result, expected)
  })

  it('loadAll(input, options)', () => {
    result = loadAll(testStr, { json: true })
    assert.deepStrictEqual(result, expected)

    result = []
    loadAll(testStr, (doc) => {
      result.push(doc)
    }, { json: true })
    assert.deepStrictEqual(result, expected)
  })

  it('loadAll(input, null, options)', () => {
    result = loadAll(testStr, null, { json: true })
    assert.deepStrictEqual(result, expected)

    result = []
    loadAll(testStr, (doc) => {
      result.push(doc)
    }, { json: true })
    assert.deepStrictEqual(result, expected)
  })

  it('empty input', () => {
    // https://github.com/nodeca/js-yaml/issues/565#issuecomment-659696047
    // NOTE: in theory, can throw instead of undefined, for load().
    assert.strictEqual(load(''), undefined)
    assert.deepStrictEqual(loadAll(''), [])
  })
})
