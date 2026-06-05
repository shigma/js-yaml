import { it } from 'node:test'

import assert from 'node:assert'
import { CORE_SCHEMA, load, defineMappingTag, defineScalarTag } from 'js-yaml'

const tags = [{
  tag: 'Include',
  defineTag: defineScalarTag
}, {
  tag: 'Include',
  defineTag: defineMappingTag
}].map((fn) => {
  return fn.defineTag(`!${fn.tag}`, {
    resolve: () => {
      return true
    },
    construct: (obj) => {
      return obj
    }
  })
})

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
