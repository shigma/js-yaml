import { it } from 'node:test'

import assert from 'node:assert'
import { DEFAULT_SCHEMA, load, NODE_KIND_MAPPING, NODE_KIND_SCALAR, createType } from 'js-yaml'

const tags = [{
  tag: 'Include',
  type: NODE_KIND_SCALAR
}, {
  tag: 'Include',
  type: NODE_KIND_MAPPING
}].map((fn) => {
  return createType(`!${fn.tag}`, {
    nodeKind: fn.type,
    resolve: () => {
      return true
    },
    construct: (obj) => {
      return obj
    }
  })
})

const schema = DEFAULT_SCHEMA.extend(tags)

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
