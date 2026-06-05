import { describe, it } from 'node:test'

import assert from 'node:assert'
import { CORE_SCHEMA, dump, load, defineMappingTag, defineScalarTag, defineSequenceTag } from 'js-yaml'

describe('Tag prefix matching', () => {
  it('should process tags matched by prefix', () => {
    const tags = [
      defineScalarTag('!', {
        matchByTagPrefix: true,
        resolve: (value, tag) => {
          return { nodeKind: 'scalar', tag, value }
        }
      }),
      defineSequenceTag('!', {
        matchByTagPrefix: true,
        create: tag => {
          return { nodeKind: 'sequence', tag, value: [] }
        },
        addItem: (container, item) => {
          container.value.push(item)
        }
      }),
      defineMappingTag('!', {
        matchByTagPrefix: true,
        create: tag => {
          return { nodeKind: 'mapping', tag, value: {} }
        },
        addPair: (container, key, value) => {
          container.value[String(key)] = value
        }
      })
    ]

    const schema = CORE_SCHEMA.withTags(tags)

    const expected = [
      {
        nodeKind: 'scalar',
        tag: '!t1',
        value: '123'
      },
      {
        nodeKind: 'sequence',
        tag: '!t2',
        value: [1, 2, 3]
      },
      {
        nodeKind: 'mapping',
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
      defineScalarTag(prefix, {
        matchByTagPrefix: true,
        resolve: (value, tag) => {
          return { prefix, tag, value }
        }
      })
    )

    tags.push(
      defineScalarTag('!bar', {
        resolve: (value) => {
          return { single: true, value }
        }
      })
    )

    const schema = CORE_SCHEMA.withTags(tags)

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

  it('should dump prefix-matched tags with custom tag names', () => {
    const tags = [
      defineScalarTag('!', {
        matchByTagPrefix: true,
        identify: (obj) => {
          return !!obj.tag
        },
        representTagName: (obj) => {
          return obj.tag
        },
        represent: (obj) => {
          return obj.value
        }
      })
    ]

    const schema = CORE_SCHEMA.withTags(tags)

    assert.strictEqual(dump({ test: { tag: 'foo', value: 'bar' } }, {
      schema: schema
    }), 'test: !<foo> bar\n')
  })
})
