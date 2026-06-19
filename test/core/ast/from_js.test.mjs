import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { CORE_SCHEMA, dump, jsToAst, load, realMapTag } from 'js-yaml'

const schema = CORE_SCHEMA.withTags(realMapTag)

describe('ast from_js', () => {
  it('returns a document array', () => {
    const documents = jsToAst({ a: 1 }, CORE_SCHEMA)

    assert.equal(documents.length, 1)
    assert.deepEqual(documents[0].directives, [])
    assert.equal(documents[0].contents.kind, 'mapping')
  })

  it('represents an invalid root as an empty document', () => {
    assert.deepEqual(jsToAst(undefined, CORE_SCHEMA), [{ contents: null, directives: [] }])
  })

  it('dedups a cycle through a Map', () => {
    const source = new Map()
    source.set('self', source)

    const dumped = dump(source, { schema })
    assert.match(dumped, /&ref_0/)
    assert.match(dumped, /\*ref_0/)

    const result = load(dumped, { schema })
    assert.strictEqual(result.get('self'), result)
  })

  it('dedups sharing inside a Map', () => {
    const shared = new Map([['x', 1]])
    const source = new Map([['a', shared], ['b', shared]])

    const dumped = dump(source, { schema })
    assert.match(dumped, /&ref_0/)
    assert.match(dumped, /\*ref_0/)

    const result = load(dumped, { schema })
    assert.strictEqual(result.get('a'), result.get('b'))
  })
})
