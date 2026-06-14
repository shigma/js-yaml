import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { CORE_SCHEMA, dump, nullCoreTag } from 'js-yaml'

// null tag whose represent renders nothing — `key:` / `- ` with no value.
const schema = CORE_SCHEMA.withTags({ ...nullCoreTag, represent: () => '' })

describe('ast represent', () => {
  it('an empty scalar leaves no trailing space', () => {
    // null → '' in a mapping / sequence: `a:` / `- a:`, never `a: ` / `- a: `.
    assert.equal(dump({ a: null }, { schema }), 'a:\n')
    assert.equal(dump([{ a: null }], { schema }), '- a:\n')

    // A real empty string stays quoted, distinct from null/empty.
    assert.equal(dump({ a: '' }, { schema }), "a: ''\n")
  })
})
