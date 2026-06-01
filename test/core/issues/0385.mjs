import { describe, it } from 'node:test'

import assert from 'node:assert'
import { DEFAULT_SCHEMA, dump, load, Type } from 'js-yaml'

describe('Multi tag', () => {
  it('should process multi tags', () => {
    const tags = ['scalar', 'mapping', 'sequence'].map(kind =>
      new Type('!', {
        kind,
        multi: true,
        resolve: () => {
          return true
        },
        construct: (value, tag) => {
          return { kind, tag, value }
        }
      })
    )

    const schema = DEFAULT_SCHEMA.extend(tags)

    const expected = [
      {
        kind: 'scalar',
        tag: '!t1',
        value: '123'
      },
      {
        kind: 'sequence',
        tag: '!t2',
        value: [1, 2, 3]
      },
      {
        kind: 'mapping',
        tag: '!t3',
        value: { a: 1, b: 2 }
      }
    ]

    assert.deepStrictEqual(load(`
- !t1 123
- !t2 [ 1, 2, 3 ]
- !t3 { a: 1, b: 2 }
`, {
      schema: schema
    }), expected)
  })

  it('should process tags depending on prefix', () => {
    const tags = ['!foo', '!bar', '!'].map(prefix =>
      new Type(prefix, {
        kind: 'scalar',
        multi: true,
        resolve: () => {
          return true
        },
        construct: (value, tag) => {
          return { prefix, tag, value }
        }
      })
    )

    tags.push(
      new Type('!bar', {
        kind: 'scalar',
        resolve: () => {
          return true
        },
        construct: (value) => {
          return { single: true, value }
        }
      })
    )

    const schema = DEFAULT_SCHEMA.extend(tags)

    const expected = [
      { prefix: '!foo', tag: '!foo', value: '1' },
      { prefix: '!foo', tag: '!foo2', value: '2' },
      { single: true, value: '3' },
      { prefix: '!bar', tag: '!bar2', value: '4' },
      { prefix: '!', tag: '!baz', value: '5' }
    ]

    assert.deepStrictEqual(load(`
- !foo 1
- !foo2 2
- !bar 3
- !bar2 4
- !baz 5
`, {
      schema: schema
    }), expected)
  })

  it('should dump multi types with custom tag', () => {
    const tags = [
      new Type('!', {
        kind: 'scalar',
        multi: true,
        predicate: (obj) => {
          return !!obj.tag
        },
        representName: (obj) => {
          return obj.tag
        },
        represent: (obj) => {
          return obj.value
        }
      })
    ]

    const schema = DEFAULT_SCHEMA.extend(tags)

    assert.strictEqual(dump({ test: { tag: 'foo', value: 'bar' } }, {
      schema: schema
    }), 'test: !<foo> bar\n')
  })
})
