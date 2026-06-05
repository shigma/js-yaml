import { it } from 'node:test'

import assert from 'node:assert'
import { CORE_SCHEMA, load, defineMappingTag, defineScalarTag } from 'js-yaml'

const tags = [
  defineScalarTag('!Include', {
    resolve: (obj) => {
      return obj
    }
  }),
  defineMappingTag('!Include', {
    create: () => ({}),
    addPair: (container, key, value) => {
      container[String(key)] = value
    }
  })
]

const schema = CORE_SCHEMA.withTags(tags)

it('Process tag with nodeKind: scalar', () => {
  assert.deepStrictEqual(load('!Include foobar', {
    schema: schema
  }), 'foobar')
})

it('Process tag with nodeKind: mapping', () => {
  assert.deepStrictEqual(load('!Include\n  location: foobar', {
    schema: schema
  }), { location: 'foobar' })
})
